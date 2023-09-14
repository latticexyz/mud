import {
  RenderDynamicField,
  RenderType,
  renderArguments,
  renderCommonData,
  renderList,
  renderRelativeImports,
  renderTableId,
  renderTypeHelpers,
  renderWithStore,
  renderedSolidityHeader,
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
import { StoreCore, StoreCoreInternal } from "${storeImportPath}StoreCore.sol";
import { Bytes } from "${storeImportPath}Bytes.sol";
import { Memory } from "${storeImportPath}Memory.sol";
import { SliceLib } from "${storeImportPath}Slice.sol";
import { EncodeArray } from "${storeImportPath}tightcoder/EncodeArray.sol";
import { FieldLayout, FieldLayoutLib } from "${storeImportPath}FieldLayout.sol";
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

FieldLayout constant _fieldLayout = ${renderFieldLayout(fields)};

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
  /** Get the table values' field layout */
  function getFieldLayout() internal pure returns (FieldLayout) {
    return _fieldLayout;
  }

  /** Get the table's key schema */
  function getKeySchema() internal pure returns (Schema) {
    SchemaType[] memory _schema = new SchemaType[](${keyTuple.length});
    ${renderList(keyTuple, ({ enumName }, index) => `_schema[${index}] = SchemaType.${enumName};`)}

    return SchemaLib.encode(_schema);
  }

  /** Get the table's value schema */
  function getValueSchema() internal pure returns (Schema) {
    SchemaType[] memory _schema = new SchemaType[](${fields.length});
    ${renderList(fields, ({ enumName }, index) => `_schema[${index}] = SchemaType.${enumName};`)}

    return SchemaLib.encode(_schema);
  }

  /** Get the table's key names */
  function getKeyNames() internal pure returns (string[] memory keyNames) {
    keyNames = new string[](${keyTuple.length});
    ${renderList(keyTuple, (keyElement, index) => `keyNames[${index}] = "${keyElement.name}";`)}
  }

  /** Get the table's field names */
  function getFieldNames() internal pure returns (string[] memory fieldNames) {
    fieldNames = new string[](${fields.length});
    ${renderList(fields, (field, index) => `fieldNames[${index}] = "${field.name}";`)}
  }

  ${renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix, _, _methodNamePrefix) => `
    /** Register the table with its config${_commentSuffix} */
    function ${_methodNamePrefix}register(${renderArguments([_typedStore, _typedTableId])}) internal {
      ${_store}.registerTable(_tableId, getFieldLayout(), getKeySchema(), getValueSchema(), getKeyNames(), getFieldNames());
    }
  `
  )}

  ${withFieldMethods ? renderFieldMethods(options) : ""}

  ${withRecordMethods ? renderRecordMethods(options) : ""}

  ${withEphemeralMethods ? renderEphemeralMethods(options) : ""}

  /** Tightly pack full data using this table's field layout */
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
  
  /** Encode keys as a bytes32 array using this table's field layout */
  function encodeKeyTuple(${renderArguments([_typedKeyArgs])}) internal pure returns (bytes32[] memory) {
    ${_keyTupleDefinition}
    return _keyTuple;
  }

  ${
    shouldRenderDelete
      ? renderWithStore(
          storeArgument,
          (_typedStore, _store, _commentSuffix, _, _methodNamePrefix) => `
    /* Delete all data for given keys${_commentSuffix} */
    function ${_methodNamePrefix}deleteRecord(${renderArguments([
            _typedStore,
            _typedTableId,
            _typedKeyArgs,
          ])}) internal {
      ${_keyTupleDefinition}
      ${_store}.deleteRecord(_tableId, _keyTuple, getFieldLayout());
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
    PackedCounter _encodedLengths;
    // Lengths are effectively checked during copy by 2**40 bytes exceeding gas limits
    unchecked {
      _encodedLengths = PackedCounterLib.pack(
        ${renderArguments(
          dynamicFields.map(({ name, arrayElement }) => {
            if (arrayElement) {
              return `${name}.length * ${arrayElement.staticByteLength}`;
            } else {
              return `bytes(${name}).length`;
            }
          })
        )}
      );
    }
    `;
  } else {
    return "";
  }
}

function renderFieldLayout(fields: RenderType[]) {
  return `FieldLayout.wrap(${encodeFieldLayout(fields)})`;
}

// TODO: refactor to new file
export const WORD_SIZE = 32;
export const MAX_TOTAL_FIELDS = 28;
export const WORD_LAST_INDEX = 31;
export const BYTE_TO_BITS = 8;
export const MAX_DYNAMIC_FIELDS = 5;
export const TOTAL_LENGTH = (WORD_SIZE - 2) * BYTE_TO_BITS;
export const NUM_STATIC_FIELDS = (WORD_SIZE - 2 - 1) * BYTE_TO_BITS;
export const NUM_DYNAMIC_FIELDS = (WORD_SIZE - 2 - 1 - 1) * BYTE_TO_BITS;

export function encodeFieldLayout(fields: RenderType[]) {
  if (fields.length > MAX_TOTAL_FIELDS) throw new Error(`FieldLayout: invalid length ${fields.length}`);
  let fieldLayout = 0n;
  let totalLength = 0;
  let dynamicFields = 0;

  for (let i = 0; i < fields.length; i++) {
    const { isDynamic, staticByteLength } = fields[i];
    if (isDynamic) {
      dynamicFields++;
      continue;
    } else if (dynamicFields > 0) {
      throw new Error(`FieldLayout: static type after dynamic type`);
    }

    totalLength += staticByteLength;
    fieldLayout |= BigInt(staticByteLength) << BigInt((WORD_LAST_INDEX - 4 - i) * BYTE_TO_BITS);
  }

  if (dynamicFields > MAX_DYNAMIC_FIELDS) throw new Error(`FieldLayout: invalid length ${dynamicFields}`);

  const staticFields = fields.length - dynamicFields;

  fieldLayout |= BigInt(totalLength) << BigInt(TOTAL_LENGTH);
  fieldLayout |= BigInt(staticFields) << BigInt(NUM_STATIC_FIELDS);
  fieldLayout |= BigInt(dynamicFields) << BigInt(NUM_DYNAMIC_FIELDS);

  return `0x${fieldLayout.toString(16).padStart(64, "0")}`;
}
