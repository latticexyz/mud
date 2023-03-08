import { renderArguments, renderCommonData, renderWithStore } from "./common.js";
import { RenderTableField, RenderTableOptions, RenderTableType } from "./types.js";

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

    // TODO: this is super inefficient right now, need to add support for pushing to arrays to the store core library to avoid reading/writing the entire array
    // (see https://github.com/latticexyz/mud/issues/438)
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
          bytes memory _blob = StoreSwitch.getField(_tableId, _primaryKeys, ${index});
          bytes memory _newBlob = abi.encodePacked(_blob, ${portionData.encoded});
          ${_store}.setField(_tableId, _primaryKeys, ${index}, _newBlob);
        }
      `
      );
    }
  }
  return result;
}

export function renderEncodeField(field: RenderTableField) {
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

export function renderDecodeValueType(field: RenderTableType, offset: number) {
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
function fieldPortionData(field: RenderTableField) {
  const methodNameSuffix = "";
  if (field.arrayElement) {
    const name = "_element";
    return {
      typeWithLocation: field.arrayElement.typeWithLocation,
      name: "_element",
      encoded: renderEncodeField({ ...field.arrayElement, arrayElement: undefined, name, methodNameSuffix }),
      title: "an element",
    };
  } else {
    const name = "_slice";
    return {
      typeWithLocation: `${field.typeId} memory`,
      name,
      encoded: renderEncodeField({ ...field, name, methodNameSuffix }),
      title: "a slice",
    };
  }
}

function renderDecodeFieldSingle(field: RenderTableField) {
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
