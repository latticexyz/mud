import { RenderField, RenderKeyTuple, RenderType } from "./types";

export function renderTypeHelpers(options: { fields: RenderField[]; keyTuple: RenderKeyTuple[] }): string {
  const { fields, keyTuple } = options;

  let result = "";

  for (const wrappingHelper of getWrappingHelpers([...fields, ...keyTuple])) {
    result += wrappingHelper;
  }

  // bool is special - it's the only primitive value type that can't be typecasted to/from
  if (fields.some(({ internalTypeId }) => internalTypeId.match("bool"))) {
    result += `
    /**
     * @notice Cast a value to a bool.
     * @dev Boolean values are encoded as uint8 (1 = true, 0 = false), but Solidity doesn't allow casting between uint8 and bool.
     * @param value The uint8 value to convert.
     * @return result The boolean value.
     */
    function _toBool(uint8 value) pure returns (bool result) {
      assembly {
        result := value
      }
    }
    `;
  }
  if (keyTuple.some(({ internalTypeId }) => internalTypeId.match("bool"))) {
    result += `
    /**
     * @notice Cast a bool to a bytes32.
     * @dev The boolean value is casted to a bytes32 value with 0 or 1 at the least significant bit.
     */
    function _boolToBytes32(bool value) pure returns (bytes32 result) {
      assembly {
        result := value
      }
    }
    `;
  }

  return result;
}

function getWrappingHelpers(array: RenderType[]): string[] {
  const wrappers = new Map<string, string>();
  const unwrappers = new Map<string, string>();
  for (const { typeWrappingData, typeWrap, typeUnwrap, internalTypeId } of array) {
    if (!typeWrappingData) continue;
    const { kind } = typeWrappingData;

    if (kind === "staticArray") {
      const { elementType, staticLength } = typeWrappingData;
      wrappers.set(typeWrap, renderWrapperStaticArray(typeWrap, elementType, staticLength, internalTypeId));
      unwrappers.set(typeUnwrap, renderUnwrapperStaticArray(typeUnwrap, elementType, staticLength, internalTypeId));
    }
  }

  return [...wrappers.values(), ...unwrappers.values()];
}

function renderWrapperStaticArray(
  functionName: string,
  elementType: string,
  staticLength: number,
  internalTypeId: string
): string {
  // WARNING: ensure this still works if changing major solidity versions!
  // (the memory layout for static arrays may change)
  return `
    /**
     * @notice Cast a dynamic array to a static array.
     * @dev In memory static arrays are just dynamic arrays without the 32 length bytes,
     * so this function moves the pointer to the first element of the dynamic array.
     * If the length of the dynamic array is smaller than the static length,
     * the function returns an uninitialized array to avoid memory corruption.
     * @param _value The dynamic array to cast.
     * @return _result The static array.
     */
    function ${functionName}(
      ${internalTypeId} memory _value
    ) pure returns (
      ${elementType}[${staticLength}] memory _result
    ) {
      if (_value.length < ${staticLength}) {
        // return an uninitialized array if the length is smaller than the fixed length to avoid memory corruption
        return _result;
      } else {
        // in memory static arrays are just dynamic arrays without the 32 length bytes
        // (without the length check this could lead to memory corruption)
        assembly {
          _result := add(_value, 0x20)
        }
      }
    }
  `;
}

function renderUnwrapperStaticArray(
  functionName: string,
  elementType: string,
  staticLength: number,
  internalTypeId: string
): string {
  // byte length for memory copying (more efficient than a loop)
  const byteLength = staticLength * 32;
  // TODO to optimize memory usage consider generalizing TightEncoder to a render-time utility
  return `
    /**
     * @notice Copy a static array to a dynamic array.
     * @dev Static arrays don't have a length prefix, so this function copies the memory from the static array to a new dynamic array.
     * @param _value The static array to copy.
     * @return _result The dynamic array.
     */ 
    function ${functionName}(
      ${elementType}[${staticLength}] memory _value
    ) pure returns (
      ${internalTypeId} memory _result
    ) {
      _result = new ${internalTypeId}(${staticLength});
      uint256 fromPointer;
      uint256 toPointer;
      assembly {
        fromPointer := _value
        toPointer := add(_result, 0x20)
      }
      Memory.copy(fromPointer, toPointer, ${byteLength});
    }
  `;
}
