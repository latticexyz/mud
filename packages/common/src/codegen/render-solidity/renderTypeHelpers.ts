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
    function _toBool(uint8 value) pure returns (bool result) {
      assembly {
        result := value
      }
    }
    `;
  }
  if (keyTuple.some(({ internalTypeId }) => internalTypeId.match("bool"))) {
    result += `
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
    function ${functionName}(
      ${internalTypeId} memory _value
    ) pure returns (
      ${elementType}[${staticLength}] memory _result
    ) {
      if (_value.length < ${staticLength}) {
        // return an uninitialized array if the length is smaller than the fixed length to avoid memory corruption
        return _result;
      } else {
        // in memory static arrays are just dynamic arrays without the length byte
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
