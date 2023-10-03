import {
  renderArguments,
  renderCommonData,
  RenderField,
  RenderType,
  renderWithFieldSuffix,
  renderWithStore,
} from "@latticexyz/common/codegen";
import { RenderTableOptions } from "./types";

export function renderFieldMethods(options: RenderTableOptions) {
  const storeArgument = options.storeArgument;
  const { _typedTableId, _typedKeyArgs, _keyTupleDefinition } = renderCommonData(options);

  let result = "";
  for (const [schemaIndex, field] of options.fields.entries()) {
    if (!options.withDynamicFieldMethods && field.isDynamic) {
      continue;
    }

    // For dynamic fields, compute the field index relative to the end of the static fields
    const _typedFieldName = `${field.typeWithLocation} ${field.name}`;

    if (options.withGetters) {
      result += renderWithFieldSuffix(options.withSuffixlessFieldMethods, field.name, (_methodNameSuffix) =>
        renderWithStore(
          storeArgument,
          (_typedStore, _store, _commentSuffix, _untypedStore, _methodNamePrefix) => `
            /**
             * @notice Get ${field.name}${_commentSuffix}.
             */
            function ${_methodNamePrefix}get${_methodNameSuffix}(${renderArguments([
            _typedStore,
            _typedTableId,
            _typedKeyArgs,
          ])}) internal view returns (${_typedFieldName}) {
              ${_keyTupleDefinition}
              ${
                field.isDynamic
                  ? `bytes memory _blob = ${_store}.getDynamicField(
                      _tableId,
                      _keyTuple,
                      ${schemaIndex - options.staticFields.length}
                    );`
                  : `bytes32 _blob = ${_store}.getStaticField(
                      _tableId,
                      _keyTuple,
                      ${schemaIndex},
                      _fieldLayout
                    );`
              }
              return ${renderDecodeFieldSingle(field)};
            }
        `
        )
      );
    }

    result += renderWithFieldSuffix(options.withSuffixlessFieldMethods, field.name, (_methodNameSuffix) =>
      renderWithStore(storeArgument, (_typedStore, _store, _commentSuffix, _untypedStore, _methodNamePrefix) => {
        const externalArguments = renderArguments([_typedStore, _typedTableId, _typedKeyArgs, _typedFieldName]);
        const setFieldMethod = field.isDynamic ? "setDynamicField" : "setStaticField";
        const encodeFieldSingle = renderEncodeFieldSingle(field);
        const internalArguments = field.isDynamic
          ? `_tableId, _keyTuple, ${schemaIndex - options.staticFields.length}, ${encodeFieldSingle}`
          : `_tableId, _keyTuple, ${schemaIndex}, ${encodeFieldSingle}, _fieldLayout`;

        return `
          /**
           * @notice Set ${field.name}${_commentSuffix}.
           */
          function ${_methodNamePrefix}set${_methodNameSuffix}(${externalArguments}) internal {
            ${_keyTupleDefinition}
            ${_store}.${setFieldMethod}(${internalArguments});
          }
        `;
      })
    );

    if (field.isDynamic) {
      const portionData = fieldPortionData(field);
      const dynamicSchemaIndex = schemaIndex - options.staticFields.length;

      if (options.withGetters) {
        result += renderWithFieldSuffix(options.withSuffixlessFieldMethods, field.name, (_methodNameSuffix) =>
          renderWithStore(
            storeArgument,
            (_typedStore, _store, _commentSuffix, _untypedStore, _methodNamePrefix) => `
              /**
               * @notice Get the length of ${field.name}${_commentSuffix}.
               */
              function ${_methodNamePrefix}length${_methodNameSuffix}(${renderArguments([
              _typedStore,
              _typedTableId,
              _typedKeyArgs,
            ])}) internal view returns (uint256) {
                ${_keyTupleDefinition}
                uint256 _byteLength = ${_store}.getDynamicFieldLength(_tableId, _keyTuple, ${dynamicSchemaIndex});
                unchecked {
                  return _byteLength / ${portionData.elementLength};
                }
              }
          `
          )
        );

        result += renderWithFieldSuffix(options.withSuffixlessFieldMethods, field.name, (_methodNameSuffix) =>
          renderWithStore(
            storeArgument,
            (_typedStore, _store, _commentSuffix, _untypedStore, _methodNamePrefix) => `
              /**
               * @notice Get an item of ${field.name}${_commentSuffix}.
               * @dev Reverts with Store_IndexOutOfBounds if \`_index\` is out of bounds for the array.
              */
              function ${_methodNamePrefix}getItem${_methodNameSuffix}(${renderArguments([
              _typedStore,
              _typedTableId,
              _typedKeyArgs,
              "uint256 _index",
            ])}) internal view returns (${portionData.typeWithLocation}) {
              ${_keyTupleDefinition}
              unchecked {
                bytes memory _blob = ${_store}.getDynamicFieldSlice(
                  _tableId,
                  _keyTuple,
                  ${dynamicSchemaIndex},
                  _index * ${portionData.elementLength},
                  (_index + 1) * ${portionData.elementLength}
                  );
                  return ${portionData.decoded};
                }
              }
            `
          )
        );
      }

      result += renderWithFieldSuffix(options.withSuffixlessFieldMethods, field.name, (_methodNameSuffix) =>
        renderWithStore(
          storeArgument,
          (_typedStore, _store, _commentSuffix, _untypedStore, _methodNamePrefix) => `
              /**
               * @notice Push ${portionData.title} to ${field.name}${_commentSuffix}.
               */
              function ${_methodNamePrefix}push${_methodNameSuffix}(${renderArguments([
            _typedStore,
            _typedTableId,
            _typedKeyArgs,
            `${portionData.typeWithLocation} ${portionData.name}`,
          ])}) internal {
              ${_keyTupleDefinition}
              ${_store}.pushToDynamicField(_tableId, _keyTuple, ${dynamicSchemaIndex}, ${portionData.encoded});
            }
            `
        )
      );

      result += renderWithFieldSuffix(options.withSuffixlessFieldMethods, field.name, (_methodNameSuffix) =>
        renderWithStore(
          storeArgument,
          (_typedStore, _store, _commentSuffix, _untypedStore, _methodNamePrefix) => `
            /**
             * @notice Pop ${portionData.title} from ${field.name}${_commentSuffix}.
             */
            function ${_methodNamePrefix}pop${_methodNameSuffix}(${renderArguments([
            _typedStore,
            _typedTableId,
            _typedKeyArgs,
          ])}) internal {
              ${_keyTupleDefinition}
              ${_store}.popFromDynamicField(_tableId, _keyTuple, ${dynamicSchemaIndex}, ${portionData.elementLength});
            }
          `
        )
      );

      result += renderWithFieldSuffix(options.withSuffixlessFieldMethods, field.name, (_methodNameSuffix) =>
        renderWithStore(storeArgument, (_typedStore, _store, _commentSuffix, _untypedStore, _methodNamePrefix) => {
          const externalArguments = renderArguments([
            _typedStore,
            _typedTableId,
            _typedKeyArgs,
            "uint256 _index",
            `${portionData.typeWithLocation} ${portionData.name}`,
          ]);

          const internalArguments = `
            _tableId,
            _keyTuple,
            ${dynamicSchemaIndex},
            uint40(_index * ${portionData.elementLength}),
            uint40(_encoded.length),
            _encoded 
          `;

          return `
            /**
             * @notice Update ${portionData.title} of ${field.name}${_commentSuffix} at \`_index\`.
             */
            function ${_methodNamePrefix}update${_methodNameSuffix}(${externalArguments}) internal {
              ${_keyTupleDefinition}
              unchecked {
                bytes memory _encoded = ${portionData.encoded};
                ${_store}.spliceDynamicData(${internalArguments});
              }
            }
          `;
        })
      );
    }
  }
  return result;
}

export function renderEncodeFieldSingle(field: RenderField) {
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
  const { staticByteLength } = field;

  const innerSlice = `Bytes.slice${staticByteLength}(_blob, ${offset})`;

  return renderCastStaticBytesToType(field, innerSlice);
}

function renderCastStaticBytesToType(field: RenderType, staticBytes: string) {
  const { staticByteLength, internalTypeId } = field;
  const bits = staticByteLength * 8;

  let result;
  if (internalTypeId.match(/^uint\d{1,3}$/) || internalTypeId === "address") {
    result = `${internalTypeId}(${staticBytes})`;
  } else if (internalTypeId.match(/^int\d{1,3}$/)) {
    result = `${internalTypeId}(uint${bits}(${staticBytes}))`;
  } else if (internalTypeId.match(/^bytes\d{1,2}$/)) {
    result = staticBytes;
  } else if (internalTypeId === "bool") {
    result = `_toBool(uint8(${staticBytes}))`;
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
    const elementFieldData = { ...field.arrayElement, arrayElement: undefined, name, methodNameSuffix };
    return {
      typeWithLocation: field.arrayElement.typeWithLocation,
      name: "_element",
      encoded: renderEncodeFieldSingle(elementFieldData),
      decoded: renderDecodeFieldSingle(elementFieldData),
      title: "an element",
      elementLength: field.arrayElement.staticByteLength,
    };
  } else {
    const name = "_slice";
    const elementFieldData = { ...field, name, methodNameSuffix };
    return {
      typeWithLocation: `${field.typeId} memory`,
      name,
      encoded: renderEncodeFieldSingle(elementFieldData),
      decoded: renderDecodeFieldSingle(elementFieldData),
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
    return renderCastStaticBytesToType(field, `bytes${field.staticByteLength}(_blob)`);
  }
}
