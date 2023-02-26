import { renderArguments, renderCommonData } from "./common.js";
import { RenderTableField, RenderTableOptions } from "./types.js";

export function renderFieldMethods(options: RenderTableOptions) {
  const { _typedTableId, _typedKeyArgs, _keyTupleDefinition } = renderCommonData(options);

  let result = "";
  for (const [index, field] of options.fields.entries()) {
    const _typedFieldName = `${field.typeWithLocation} ${field.name}`;

    result += `
    /** Set ${field.name} */
    function set${field.methodNameSuffix}(${renderArguments([
      _typedTableId,
      _typedKeyArgs,
      _typedFieldName,
    ])}) internal {
      ${_keyTupleDefinition}
      StoreSwitch.setField(_tableId, _keyTuple, ${index}, ${renderEncodeField(field)});
    }

    /** Get ${field.name} */
    function get${field.methodNameSuffix}(${renderArguments([
      _typedTableId,
      _typedKeyArgs,
    ])}) internal view returns (${_typedFieldName}) {
      ${_keyTupleDefinition}
      bytes memory _blob = StoreSwitch.getField(_tableId, _keyTuple, ${index});
      return ${renderDecodeFieldSingle(field)};
    }
    `;
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
  return `${func}(${field.name})`;
}

export function renderDecodeValueType(typeId: string, staticByteLength: number, offset: number) {
  const innerSlice = `Bytes.slice${staticByteLength}(_blob, ${offset})`;
  const bits = staticByteLength * 8;

  if (typeId.match(/^uint\d{1,3}$/) || typeId === "address") {
    return `${typeId}(${innerSlice})`;
  } else if (typeId.match(/^int\d{1,3}$/)) {
    return `${typeId}(uint${bits}(${innerSlice})`;
  } else if (typeId.match(/^bytes\d{1,2}$/)) {
    return innerSlice;
  } else if (typeId === "bool") {
    return `_toBool(uint8(${innerSlice}))`;
  } else {
    throw new Error(`Unknown value type id ${typeId}`);
  }
}

function renderDecodeFieldSingle(field: RenderTableField) {
  const { typeId, isDynamic, arrayElement } = field;
  if (arrayElement) {
    // arrays
    return `SliceLib.getSubslice(_blob, 0, _blob.length).decodeArray_${arrayElement.typeId}()`;
  } else if (isDynamic) {
    // bytes/string
    return `${typeId}(_blob)`;
  } else {
    return renderDecodeValueType(typeId, field.staticByteLength, 0);
  }
}
