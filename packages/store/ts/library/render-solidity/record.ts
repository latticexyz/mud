import {
  renderList,
  renderArguments,
  renderCommonData,
  renderWithStore,
  RenderDynamicField,
} from "@latticexyz/common/codegen";
import { renderDecodeValueType } from "./field";
import { RenderTableOptions } from "./types";

export function renderRecordMethods(options: RenderTableOptions) {
  const { structName, storeArgument } = options;
  const { _tableId, _typedTableId, _keyArgs, _typedKeyArgs } = renderCommonData(options);

  let result = renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix) => `
    /** Get the full data${_commentSuffix} */
    function get(${renderArguments([
      _typedStore,
      _typedTableId,
      _typedKeyArgs,
    ])}) internal view returns (${renderDecodedRecord(options)}) {
      bytes32[] memory _primaryKeys = encodeKey(${renderArguments([_keyArgs])});

      bytes memory _blob = ${_store}.getRecord(_tableId, _primaryKeys, getSchema());
      return decode(_blob);
    }
  `
  );

  result += renderWithStore(
    storeArgument,
    (_typedStore, _store, _commentSuffix) => `
    /** Set the full data using individual values${_commentSuffix} */
    function set(${renderArguments([
      _typedStore,
      _typedTableId,
      _typedKeyArgs,
      renderArguments(options.fields.map(({ name, typeWithLocation }) => `${typeWithLocation} ${name}`)),
    ])}) internal {
      bytes memory _data = encode(${renderArguments(options.fields.map(({ name }) => name))});
      bytes32[] memory _primaryKeys = encodeKey(${renderArguments([_keyArgs])});

      ${_store}.setRecord(_tableId, _primaryKeys, _data);
    }
  `
  );

  if (structName !== undefined) {
    result += renderWithStore(
      storeArgument,
      (_typedStore, _store, _commentSuffix, _untypedStore) => `
      /** Set the full data using the data struct${_commentSuffix} */
      function set(${renderArguments([
        _typedStore,
        _typedTableId,
        _typedKeyArgs,
        `${structName} memory _table`,
      ])}) internal {
        set(${renderArguments([
          _untypedStore,
          _tableId,
          _keyArgs,
          renderArguments(options.fields.map(({ name }) => `_table.${name}`)),
        ])});
      }
    `
    );
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
        ${fieldNamePrefix}${field.name} = ${renderDecodeValueType(field, staticOffsets[index])};
        `
      )}
      // Store trims the blob if dynamic fields are all empty
      if (_blob.length > ${totalStaticLength}) {
        uint256 _start;
        // skip static data length + dynamic lengths word
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
        ${fieldNamePrefix}${field.name} = ${renderDecodeValueType(field, staticOffsets[index])};
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

function renderDecodeDynamicFieldPartial(field: RenderDynamicField) {
  const { typeId, arrayElement, typeWrap } = field;
  if (arrayElement) {
    // arrays
    return `${typeWrap}(
      SliceLib.getSubslice(_blob, _start, _end).decodeArray_${arrayElement.typeId}()
    )`;
  } else {
    // bytes/string
    return `${typeWrap}(
      ${typeId}(
        SliceLib.getSubslice(_blob, _start, _end).toBytes()
      )
    )`;
  }
}
