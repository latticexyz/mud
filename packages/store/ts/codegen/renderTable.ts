import {
  renderArguments,
  renderCommonData,
  renderList,
  renderRelativeImports,
  renderTableId,
  renderTypeHelpers,
  renderWithStore,
  renderedSolidityHeader,
  RenderDynamicField,
  RenderStaticField,
} from "@latticexyz/common/codegen";
import { renderEphemeralMethods } from "./ephemeral";
import { renderEncodeFieldSingle, renderFieldMethods } from "./field";
import { renderRecordData, renderRecordMethods } from "./record";
import { renderFieldLayout } from "./renderFieldLayout";
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

    ${renderFieldLayout(fields)}

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
        SchemaType[] memory _keySchema = new SchemaType[](${keyTuple.length});
        ${renderList(keyTuple, ({ enumName }, index) => `_keySchema[${index}] = SchemaType.${enumName};`)}

        return SchemaLib.encode(_keySchema);
      }

      /** Get the table's value schema */
      function getValueSchema() internal pure returns (Schema) {
        SchemaType[] memory _valueSchema = new SchemaType[](${fields.length});
        ${renderList(fields, ({ enumName }, index) => `_valueSchema[${index}] = SchemaType.${enumName};`)}

        return SchemaLib.encode(_valueSchema);
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
            ${_store}.registerTable(_tableId, _fieldLayout, getKeySchema(), getValueSchema(), getKeyNames(), getFieldNames());
          }
        `
      )}

      ${withFieldMethods ? renderFieldMethods(options) : ""}

      ${withRecordMethods ? renderRecordMethods(options) : ""}

      ${withEphemeralMethods ? renderEphemeralMethods(options) : ""}

      ${renderEncodeStatic(staticFields)}

      ${renderEncodedLengths(dynamicFields)}

      ${renderEncodeDynamic(dynamicFields)}

      /** Tightly pack full data using this table's field layout */
      function encode(${renderArguments(
        options.fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
      )}) internal pure returns (bytes memory) {
        ${renderRecordData(options)}

        return abi.encodePacked(_staticData, _encodedLengths, _dynamicData);
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
                  ${_store}.deleteRecord(_tableId, _keyTuple, _fieldLayout);
                }
              `
            )
          : ""
      }
    }

    ${renderTypeHelpers(options)}
  `;
}

function renderEncodeStatic(staticFields: RenderStaticField[]) {
  if (staticFields.length === 0) return "";

  return `
    /** Tightly pack static data using this table's schema */
    function encodeStatic(${renderArguments(
      staticFields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
    )}) internal pure returns (bytes memory) {
      return abi.encodePacked(${renderArguments(staticFields.map(({ name }) => name))});
    }
  `;
}

function renderEncodedLengths(dynamicFields: RenderDynamicField[]) {
  if (dynamicFields.length === 0) return "";

  return `
    /** Tightly pack dynamic data using this table's schema */
    function encodeLengths(${renderArguments(
      dynamicFields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
    )}) internal pure returns (PackedCounter _encodedLengths) {
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
    }
  `;
}

function renderEncodeDynamic(dynamicFields: RenderDynamicField[]) {
  if (dynamicFields.length === 0) return "";

  return `
    /** Tightly pack dynamic data using this table's schema */
    function encodeDynamic(${renderArguments(
      dynamicFields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)
    )}) internal pure returns (bytes memory) {
      return abi.encodePacked(${renderArguments(dynamicFields.map((field) => renderEncodeFieldSingle(field)))});
    }
  `;
}
