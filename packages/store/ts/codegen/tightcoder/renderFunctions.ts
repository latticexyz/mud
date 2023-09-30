import { getLeftPaddingBits } from "@latticexyz/common/codegen";

export function renderTightCoderDecode(element: { internalTypeId: string; staticByteLength: number }) {
  return `
    /**
     * @notice Decodes a slice into an array of ${element.internalTypeId}.
     * @dev Uses TightCoder for initial decoding, and then assembly for memory conversion.
     * @param _input The slice to decode.
     * @return _output The decoded array of ${element.internalTypeId}.
     */
    function decodeArray_${element.internalTypeId}(
      Slice _input
    ) internal pure returns (
      ${element.internalTypeId}[] memory _output
    ) {
      bytes32[] memory _genericArray = TightCoder.decode(
        _input,
        ${element.staticByteLength},
        ${getLeftPaddingBits(element)}
      );
      assembly {
        _output := _genericArray
      }
    }
  `;
}

export function renderTightCoderEncode(element: { internalTypeId: string; staticByteLength: number }) {
  return `

    /**
     * @notice Encodes an array of ${element.internalTypeId} into a tightly packed bytes representation.
     * @param _input The array of ${element.internalTypeId} values to be encoded.
     * @return The resulting tightly packed bytes representation of the input array.
     */
    function encode(${element.internalTypeId}[] memory _input) internal pure returns (bytes memory) {
      bytes32[] memory _genericArray;
      assembly {
        _genericArray := _input
      }
      return TightCoder.encode(
        _genericArray,
        ${element.staticByteLength},
        ${getLeftPaddingBits(element)}
      );
    }
  `;
}
