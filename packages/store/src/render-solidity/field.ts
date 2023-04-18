import {
  renderArguments,
  renderCommonData,
  RenderField,
  RenderType,
  renderWithStore,
} from "@latticexyz/common-codegen";
import { RenderTableOptions } from "./types.js";

export function renderFieldMethods(options: RenderTableOptions) {
  const storeArgument = options.storeArgument;
  const { _typedTableId, _typedKeyArgs, _primaryKeysDefinition } = renderCommonData(options);

  let result = "";
  for (const [index, field] of options.fields.entries()) {
    const _typedFieldName = `${field.typeWithLocation} ${field.name}`;

    result += renderWithStore(
      storeArgument,
      (_typedStore, _store, _commentSuffix) => `
      /** Get ${field.name}${_commentSuffix} */
      function get${field.methodNameSuffix}(${renderArguments([
        _typedStore,
        _typedTableId,
        _typedKeyArgs,
      ])}) internal view returns (${_typedFieldName}) {
        ${_primaryKeysDefinition}
        bytes memory _blob = ${_store}.getField(_tableId, _primaryKeys, ${index});
        return ${renderDecodeFieldSingle(field)};
      }
    `
    );

    result += renderWithStore(
      storeArgument,
      (_typedStore, _store, _commentSuffix) => `
      /** Set ${field.name}${_commentSuffix} */
      function set${field.methodNameSuffix}(${renderArguments([
        _typedStore,
        _typedTableId,
        _typedKeyArgs,
        _typedFieldName,
      ])}) internal {
        ${_primaryKeysDefinition}
        ${_store}.setField(_tableId, _primaryKeys, ${index}, ${renderEncodeField(field)});
      }
    `
    );

    if (field.isDynamic) {
      const portionData = fieldPortionData(field);

      result += renderWithStore(
        storeArgument,
        (_typedStore, _store, _commentSuffix) => `
        /** Push ${portionData.title} to ${field.name}${_commentSuffix} */
        function push${field.methodNameSuffix}(${renderArguments([
          _typedStore,
          _typedTableId,
          _typedKeyArgs,
          `${portionData.typeWithLocation} ${portionData.name}`,
        ])}) internal {
          ${_primaryKeysDefinition}
          ${_store}.pushToField(_tableId, _primaryKeys, ${index}, ${portionData.encoded});
        }
      `
      );

      result += renderWithStore(
        storeArgument,
        (_typedStore, _store, _commentSuffix) => `
        /** Update ${portionData.title} of ${field.name}${_commentSuffix} at \`_index\` */
        function update${field.methodNameSuffix}(${renderArguments([
          _typedStore,
          _typedTableId,
          _typedKeyArgs,
          "uint256 _index",
          `${portionData.typeWithLocation} ${portionData.name}`,
        ])}) internal {
          ${_primaryKeysDefinition}
          ${_store}.updateInField(
            _tableId,
            _primaryKeys,
            ${index},
            _index * ${portionData.elementLength},
            ${portionData.encoded}
          );
        }
      `
      );
    }
  }
  return result;
}

export function renderEncodeField(field: RenderField) {
  let func;
  if (field.arrayElement) {
    func = "EncodeArray.encode";
  } else if (field.isDynamic) {
    func = "bytes";
  } else {
    func = "abi.encodePacked";
  }
  return `${func}(${field.typeUnwrap}(${field.name}))`;
}

export function renderDecodeValueType(field: RenderType, offset: number) {
  const { staticByteLength, internalTypeId } = field;

  const innerSlice = `Bytes.slice${staticByteLength}(_blob, ${offset})`;
  const bits = staticByteLength * 8;

  let result;
  if (internalTypeId.match(/^uint\d{1,3}$/) || internalTypeId === "address") {
    result = `${internalTypeId}(${innerSlice})`;
  } else if (internalTypeId.match(/^int\d{1,3}$/)) {
    result = `${internalTypeId}(uint${bits}(${innerSlice}))`;
  } else if (internalTypeId.match(/^bytes\d{1,2}$/)) {
    result = innerSlice;
  } else if (internalTypeId === "bool") {
    result = `_toBool(uint8(${innerSlice}))`;
  } else {
    throw new Error(`Unknown value type id ${internalTypeId}`);
  }
  return `${field.typeWrap}(${result})`;
}

/** bytes/string are dynamic, but aren't really arrays */
function fieldPortionData(field: RenderField) {
  const methodNameSuffix = "";
  if (field.arrayElement) {
    const name = "_element";
    return {
      typeWithLocation: field.arrayElement.typeWithLocation,
      name: "_element",
      encoded: renderEncodeField({ ...field.arrayElement, arrayElement: undefined, name, methodNameSuffix }),
      title: "an element",
      elementLength: field.arrayElement.staticByteLength,
    };
  } else {
    const name = "_slice";
    return {
      typeWithLocation: `${field.typeId} memory`,
      name,
      encoded: renderEncodeField({ ...field, name, methodNameSuffix }),
      title: "a slice",
      elementLength: 1,
    };
  }
}

function renderDecodeFieldSingle(field: RenderField) {
  const { isDynamic, arrayElement } = field;
  if (arrayElement) {
    // arrays
    return `${field.typeWrap}(
      SliceLib.getSubslice(_blob, 0, _blob.length).decodeArray_${arrayElement.internalTypeId}()
    )`;
  } else if (isDynamic) {
    // bytes/string
    return `${field.typeWrap}(${field.internalTypeId}(_blob))`;
  } else {
    return renderDecodeValueType(field, 0);
  }
}
