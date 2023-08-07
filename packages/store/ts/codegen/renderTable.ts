import {
  renderArguments,
  renderCommonData,
  renderList,
  renderedSolidityHeader,
  renderRelativeImports,
  renderTableId,
  renderValueTypeToBytes32,
  renderWithStore,
  renderTypeHelpers,
  RenderDynamicField,
} from "@latticexyz/common/codegen";
import { renderEphemeralMethods } from "./ephemeral";
import { renderEncodeFieldSingle, renderFieldMethods } from "./field";
import { renderRecordMethods } from "./record";
import { RenderTableOptions } from "./types";

export function renderTable(options: RenderTableOptions) {
  const {
    imports,
    libraryName,
    structName,
    staticResourceData,
    storeImportPath,
    fields,
    staticFields,
    dynamicFields,
    withFieldMethods,
    withRecordMethods,
    withEphemeralMethods,
    storeArgument,
    keyTuple,
  } = options;

  const { _typedTableId, _typedKeyArgs, _keyTupleDefinition } = renderCommonData(options);
  const shouldRenderDelete = !withEphemeralMethods;

  return `${renderedSolidityHeader}

// Import schema type
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

// Import store internals
import { IStore } from "${storeImportPath}IStore.sol";
import { StoreSwitch } from "${storeImportPath}StoreSwitch.sol";
import { StoreCore } from "${storeImportPath}StoreCore.sol";
import { Bytes } from "${storeImportPath}Bytes.sol";
import { Memory } from "${storeImportPath}Memory.sol";
import { SliceLib } from "${storeImportPath}Slice.sol";
import { EncodeArray } from "${storeImportPath}tightcoder/EncodeArray.sol";
import { Schema, SchemaLib } from "${storeImportPath}Schema.sol";
import { PackedCounter, PackedCounterLib } from "${storeImportPath}PackedCounter.sol";

${
  imports.length > 0
    ? `
      // Import user types
      ${renderRelativeImports(imports)}
    `
    : ""
}

${staticResourceData ? renderTableId(staticResourceData).tableIdDefinition : ""}

${
  !structName
    ? ""
    : `
      struct ${structName} {
        ${renderList(fields, ({ name, typeId }) => `${typeId} ${name};`)}
      }
`
}

library ${libraryName} {
  /** Get the table's schema */
  function getSchema() internal pure returns (Schema) {
    SchemaType[] memory _schema = new SchemaType[](${fields.length});
    ${renderList(fields, ({ enumName }, index) => `_schema[${index}] = SchemaType.${enumName};`)}

    return SchemaLib.encode(_schema);
  }

  function getKeySchema() internal pure returns (Schema) {
    SchemaType[] memory _schema = new SchemaType[](${keyTuple.length});
    ${renderList(keyTuple, ({ enumName }, index) => `_schema[${index}] = SchemaType.${enumName};`)}

    return SchemaLib.encode(_schema);
  }

  /** Get the table's metadata */
  function getMetadata() internal pure returns (string memory, string[] memory) {
    string[] memory _fieldNames = new string[](${fields.length});
    ${renderList(fields, (field, index) => `_fieldNames[${index}] = "${field.name}";`)}
    return ("${libraryName}", _fieldNames);
  }

  ${renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix) => `
    /** Register the table's schema${_commentSuffix} */
    function registerSchema(${renderArguments([_typedStore, _typedTableId])}) internal {
      ${_store}.registerSchema(_tableId, getSchema(), getKeySchema());
    }
  `
  )}
  ${renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix) => `
    /** Set the table's metadata${_commentSuffix} */
    function setMetadata(${renderArguments([_typedStore, _typedTableId])}) internal {
      (string memory _tableName, string[] memory _fieldNames) = getMetadata();
      ${_store}.setMetadata(_tableId, _tableName, _fieldNames);
    }
  `
  )}

  ${withFieldMethods ? renderFieldMethods(options) : ""}

  ${withRecordMethods ? renderRecordMethods(options) : ""}

  ${withEphemeralMethods ? renderEphemeralMethods(options) : ""}

  /** Tightly pack full data using this table's schema */
  function encode(${renderArguments(
    options.fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
  )}) internal pure returns (bytes memory) {
    ${renderEncodedLengths(dynamicFields)}
    return abi.encodePacked(${renderArguments([
      renderArguments(staticFields.map(({ name }) => name)),
      ...(dynamicFields.length === 0
        ? []
        : ["_encodedLengths.unwrap()", renderArguments(dynamicFields.map((field) => renderEncodeFieldSingle(field)))]),
    ])});
  }
  
  /** Encode keys as a bytes32 array using this table's schema */
  function encodeKeyTuple(${renderArguments([_typedKeyArgs])}) internal pure returns (bytes32[] memory _keyTuple) {
    _keyTuple = new bytes32[](${keyTuple.length});
    ${renderList(keyTuple, (key, index) => `_keyTuple[${index}] = ${renderValueTypeToBytes32(key.name, key)};`)}
  }

  ${
    shouldRenderDelete
      ? renderWithStore(
          storeArgument,
          (_typedStore, _store, _commentSuffix) => `
    /* Delete all data for given keys${_commentSuffix} */
    function deleteRecord(${renderArguments([_typedStore, _typedTableId, _typedKeyArgs])}) internal {
      ${_keyTupleDefinition}
      ${_store}.deleteRecord(_tableId, _keyTuple);
    }
  `
        )
      : ""
  }
}

${renderTypeHelpers(options)}

`;
}

function renderEncodedLengths(dynamicFields: RenderDynamicField[]) {
  if (dynamicFields.length > 0) {
    return `
    uint40[] memory _counters = new uint40[](${dynamicFields.length});
    ${renderList(dynamicFields, ({ name, arrayElement }, index) => {
      if (arrayElement) {
        return `_counters[${index}] = uint40(${name}.length * ${arrayElement.staticByteLength});`;
      } else {
        return `_counters[${index}] = uint40(bytes(${name}).length);`;
      }
    })}
    PackedCounter _encodedLengths = PackedCounterLib.pack(_counters);
    `;
  } else {
    return "";
  }
}
