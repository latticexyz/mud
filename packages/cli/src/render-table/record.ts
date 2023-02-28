import { renderList, renderArguments, renderCommonData } from "./common.js";
import { renderDecodeValueType, renderEncodeField } from "./field.js";
import { RenderTableDynamicField, RenderTableOptions, RenderTableStaticField } from "./types.js";

export function renderRecordMethods(options: RenderTableOptions) {
  const { staticFields, dynamicFields, structName, storeArgument } = options;
  const { _tableId, _typedTableId, _keyArgs, _typedKeyArgs, _primaryKeysDefinition } = renderCommonData(options);

  let result = `
  /** Get the full data */
  function get(${renderArguments([_typedTableId, _typedKeyArgs])}) internal view returns (${renderDecodedRecord(
    options
  )}) {
    ${_primaryKeysDefinition}
    bytes memory _blob = StoreSwitch.getRecord(_tableId, _primaryKeys, getSchema());
    return decode(_blob);
  }
  `;

  if (storeArgument) {
    result += `
    /** Get the full data from the specified store */
    function get(${renderArguments([
      _typedTableId,
      `IStore _store`,
      _typedKeyArgs,
    ])}) internal view returns (${renderDecodedRecord(options)}) {
      ${_primaryKeysDefinition}
      bytes memory _blob = _store.getRecord(_tableId, _primaryKeys);
      return decode(_blob);
    }
    `;
  }

  result += `
  /** Set the full data using individual values */
  function set(${renderArguments([
    _typedTableId,
    _typedKeyArgs,
    renderArguments(options.fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)),
  ])}) internal {
    ${renderEncodedLengths(dynamicFields)}
    bytes memory _data = abi.encodePacked(${renderArguments([
      renderArguments(staticFields.map(({ name }) => name)),
      // TODO try gas optimization (preallocate for all, encodePacked statics, and direct encode dynamics)
      ...(dynamicFields.length === 0
        ? []
        : ["_encodedLengths.unwrap()", renderArguments(dynamicFields.map((field) => renderEncodeField(field)))]),
    ])});

    ${_primaryKeysDefinition}

    StoreSwitch.setRecord(_tableId, _primaryKeys, _data);
  }
  `;

  if (structName !== undefined) {
    result += `
    /** Set the full data using the data struct */
    function set(${renderArguments([_typedTableId, _typedKeyArgs, `${structName} memory _table`])}) internal {
      set(${renderArguments([
        _tableId,
        _keyArgs,
        renderArguments(options.fields.map(({ name }) => `_table.${name}`)),
      ])});
    }
    `;
  }

  result += renderDecodeFunction(options);

  return result;
}

// Renders the `decode` function that parses a bytes blob into the table data
function renderDecodeFunction({ structName, fields, staticFields, dynamicFields }: RenderTableOptions) {
  // either set struct properties, or just variables
  const renderedDecodedRecord = structName
    ? `${structName} memory _table`
    : renderArguments(fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`));
  const fieldNamePrefix = structName ? "_table." : "";

  // Static field offsets
  const staticOffsets = staticFields.map(() => 0);
  let _acc = 0;
  for (const [index, field] of staticFields.entries()) {
    staticOffsets[index] = _acc;
    _acc += field.staticByteLength;
  }

  if (dynamicFields.length > 0) {
    const totalStaticLength = staticFields.reduce((acc, { staticByteLength }) => acc + staticByteLength, 0);
    // decode static (optionally) and dynamic data
    return `
    /** Decode the tightly packed blob using this table's schema */
    function decode(bytes memory _blob) internal view returns (${renderedDecodedRecord}) {
      // ${totalStaticLength} is the total byte length of static data
      PackedCounter _encodedLengths = PackedCounter.wrap(Bytes.slice32(_blob, ${totalStaticLength})); 

      ${renderList(
        staticFields,
        (field, index) => `
        ${fieldNamePrefix}${field.name} = ${renderDecodeStaticFieldPartial(field, staticOffsets[index])};
        `
      )}
      uint256 _start;
      uint256 _end = ${totalStaticLength + 32};
      ${renderList(
        dynamicFields,
        (field, index) => `
        _start = _end;
        _end += _encodedLengths.atIndex(${index});
        ${fieldNamePrefix}${field.name} = ${renderDecodeDynamicFieldPartial(field)};
        `
      )}
    }
  `;
  } else {
    // decode only static data
    return `
    /** Decode the tightly packed blob using this table's schema */
    function decode(bytes memory _blob) internal pure returns (${renderedDecodedRecord}) {
      ${renderList(
        staticFields,
        (field, index) => `
        ${fieldNamePrefix}${field.name} = ${renderDecodeStaticFieldPartial(field, staticOffsets[index])};
        `
      )}
    }
    `;
  }
}

// contents of `returns (...)` for record getter/decoder
function renderDecodedRecord({ structName, fields }: RenderTableOptions) {
  if (structName) {
    return `${structName} memory _table`;
  } else {
    return renderArguments(fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`));
  }
}

function renderDecodeDynamicFieldPartial(field: RenderTableDynamicField) {
  const { typeId, arrayElement } = field;
  if (arrayElement) {
    // arrays
    return `SliceLib.getSubslice(_blob, _start, _end).decodeArray_${arrayElement.typeId}()`;
  } else {
    // bytes/string
    return `${typeId}(SliceLib.getSubslice(_blob, _start, _end).toBytes())`;
  }
}

function renderDecodeStaticFieldPartial(field: RenderTableStaticField, start: number) {
  const { typeId, staticByteLength } = field;
  return renderDecodeValueType(typeId, staticByteLength, start);
}

function renderEncodedLengths(dynamicFields: RenderTableDynamicField[]) {
  if (dynamicFields.length > 0) {
    return `
    uint16[] memory _counters = new uint16[](${dynamicFields.length});
    ${renderList(dynamicFields, ({ name, arrayElement }, index) => {
      if (arrayElement) {
        return `_counters[${index}] = uint16(${name}.length * ${arrayElement.staticByteLength});`;
      } else {
        return `_counters[${index}] = uint16(bytes(${name}).length);`;
      }
    })}
    PackedCounter _encodedLengths = PackedCounterLib.pack(_counters);
    `;
  } else {
    return "";
  }
}
