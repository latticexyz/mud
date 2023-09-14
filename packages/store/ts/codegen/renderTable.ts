import {
  renderArguments,
  renderCommonData,
  renderList,
  renderedSolidityHeader,
  renderRelativeImports,
  renderTableId,
  renderWithStore,
  renderTypeHelpers,
  RenderDynamicField,
} from "@latticexyz/common/codegen";
import { renderOffchainMethods } from "./offchain";
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
    offchainOnly,
    storeArgument,
    keyTuple,
  } = options;

  const { _typedTableId, _typedKeyArgs, _keyTupleDefinition } = renderCommonData(options);
  const shouldRenderDelete = !offchainOnly;

  return `
    ${renderedSolidityHeader}

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
        uint256[] memory _fieldLayout = new uint256[](${staticFields.length});
        ${renderList(staticFields, ({ staticByteLength }, index) => `_fieldLayout[${index}] = ${staticByteLength};`)}

        return FieldLayoutLib.encode(_fieldLayout, ${dynamicFields.length});
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
        (_typedStore, _store, _commentSuffix) => `
        /** Register the table with its config${_commentSuffix} */
        function register(${renderArguments([_typedStore, _typedTableId])}) internal {
          ${_store}.registerTable(
            _tableId,
            getFieldLayout(),
            getKeySchema(),
            getValueSchema(),
            ${offchainOnly ? "true" : "false"},
            getKeyNames(),
            getFieldNames()
          );
        }
      `
      )}

      ${withFieldMethods ? renderFieldMethods(options) : ""}

      ${withRecordMethods ? renderRecordMethods(options) : ""}

      ${offchainOnly ? renderOffchainMethods(options) : ""}

      /** Tightly pack full data using this table's field layout */
      function encode(${renderArguments(
        options.fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
      )}) internal pure returns (bytes memory) {
        ${renderEncodedLengths(dynamicFields)}
        return abi.encodePacked(${renderArguments([
          renderArguments(staticFields.map(({ name }) => name)),
          ...(dynamicFields.length === 0
            ? []
            : [
                "_encodedLengths.unwrap()",
                renderArguments(dynamicFields.map((field) => renderEncodeFieldSingle(field))),
              ]),
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
              (_typedStore, _store, _commentSuffix) => `
                /* Delete all data for given keys${_commentSuffix} */
                function deleteRecord(${renderArguments([_typedStore, _typedTableId, _typedKeyArgs])}) internal {
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
