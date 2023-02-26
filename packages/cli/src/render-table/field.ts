import { renderArguments, renderCommonData } from "./common.js";
import { RenderTableField, RenderTableOptions } from "./types.js";

export function renderFieldMethods(options: RenderTableOptions) {
  const { _typedTableId, _typedKeyArgs, _primaryKeysDefinition } = renderCommonData(options);

  let result = "";
  for (const [index, field] of options.fields.entries()) {
    const _typedFieldName = `${field.typeWithLocation} ${field.name}`;

    result += `
    /** Get ${field.name} */
    function get${field.methodNameSuffix}(${renderArguments([
      _typedTableId,
      _typedKeyArgs,
    ])}) internal view returns (${_typedFieldName}) {
      ${_primaryKeysDefinition}
      bytes memory _blob = StoreSwitch.getField(_tableId, _primaryKeys, ${index});
      return ${renderDecodeFieldSingle(field)};
    }

    /** Set ${field.name} */
    function set${field.methodNameSuffix}(${renderArguments([
      _typedTableId,
      _typedKeyArgs,
      _typedFieldName,
    ])}) internal {
      ${_primaryKeysDefinition}
      StoreSwitch.setField(_tableId, _primaryKeys, ${index}, ${renderEncodeField(field)});
    }
    `;

    // TODO: this is super inefficient right now, need to add support for pushing to arrays to the store core library to avoid reading/writing the entire array
    if (field.isDynamic) {
      const portionData = fieldPortionData(field);

      result += `
      /** Push ${portionData.title} to ${field.name} */
      function push${field.methodNameSuffix}(${renderArguments([
        _typedTableId,
        _typedKeyArgs,
        `${portionData.typeWithLocation} ${portionData.name}`,
      ])}) internal {
        ${_primaryKeysDefinition}
        bytes memory _blob = StoreSwitch.getField(_tableId, _primaryKeys, ${index});
        bytes memory _newBlob = abi.encodePacked(_blob, ${portionData.encodeFunc}(${portionData.name}));
        StoreSwitch.setField(_tableId, _primaryKeys, ${index}, _newBlob);
      }
      `;
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

/** bytes/string are dynamic, but aren't really arrays */
function fieldPortionData(field: RenderTableField) {
  if (field.arrayElement) {
    return {
      typeWithLocation: field.arrayElement.typeWithLocation,
      name: "_element",
      encodeFunc: "abi.encodePacked",
      title: "an element",
    };
  } else {
    return {
      typeWithLocation: `${field.typeId} memory`,
      name: "_slice",
      encodeFunc: "bytes",
      title: "a slice",
    };
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
