import {
  renderArguments,
  renderCommonData,
  renderList,
  renderedSolidityHeader,
  renderImports,
  renderTableId,
  renderWithStore,
} from "./common.js";
import { renderFieldMethods } from "./field.js";
import { renderRecordMethods } from "./record.js";
import { RenderTableOptions } from "./types.js";

export function renderTable(options: RenderTableOptions) {
  const {
    imports,
    libraryName,
    structName,
    staticRouteData,
    storeImportPath,
    fields,
    withRecordMethods,
    storeArgument,
  } = options;

  const { _typedTableId, _typedKeyArgs, _primaryKeysDefinition } = renderCommonData(options);

  return `${renderedSolidityHeader}

// Import schema type
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

// Import store internals
import { IStore } from "${storeImportPath}IStore.sol";
import { StoreSwitch } from "${storeImportPath}StoreSwitch.sol";
import { StoreCore } from "${storeImportPath}StoreCore.sol";
import { Bytes } from "${storeImportPath}Bytes.sol";
import { SliceLib } from "${storeImportPath}Slice.sol";
import { EncodeArray } from "${storeImportPath}tightcoder/EncodeArray.sol";
import { Schema, SchemaLib } from "${storeImportPath}Schema.sol";
import { PackedCounter, PackedCounterLib } from "${storeImportPath}PackedCounter.sol";

${
  imports.length > 0
    ? `
      // Import user types
      ${renderImports(imports)}
    `
    : ""
}

${staticRouteData ? renderTableId(staticRouteData).tableIdDefinition : ""}

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
      ${_store}.registerSchema(_tableId, getSchema());
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

  ${renderFieldMethods(options)}

  ${withRecordMethods ? renderRecordMethods(options) : ""}

  ${renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix) => `
    /* Delete all data for given keys${_commentSuffix} */
    function deleteRecord(${renderArguments([_typedStore, _typedTableId, _typedKeyArgs])}) internal {
      ${_primaryKeysDefinition}
      ${_store}.deleteRecord(_tableId, _primaryKeys);
    }
  `
  )}
}

${
  // nothing can be cast to bool, so an assembly helper is required
  !fields.some(({ typeId }) => typeId === "bool")
    ? ""
    : `
  function _toBool(uint8 value) pure returns (bool result) {
    assembly {
      result := value
    }
  }
`
}

${
  // nothing can be cast from bool, so an assembly helper is required
  !options.primaryKeys.some(({ typeId }) => typeId === "bool")
    ? ""
    : `
  function _boolToBytes32(bool value) pure returns (bytes32 result) {
    assembly {
      result := value
    }
  }
`
}

`;
}
