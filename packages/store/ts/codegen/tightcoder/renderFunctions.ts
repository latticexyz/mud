import { isLeftAligned, shiftLeftBits } from "@latticexyz/common/codegen";

export function renderTightCoderDecode(element: { internalTypeId: string; staticByteLength: number }) {
  return `
    function decodeArray_${element.internalTypeId}(
      Slice _input
    ) internal pure returns (
      ${element.internalTypeId}[] memory _output
    ) {
      bytes32[] memory _genericArray = TightCoder.decode(
        _input,
        ${element.staticByteLength},
        ${isLeftAligned(element)}
      );
      assembly {
        _output := _genericArray
      }
    }
  `.trim();
}

export function renderTightCoderEncode(element: { internalTypeId: string; staticByteLength: number }) {
  return `
    function encodeToLocation(${element.internalTypeId}[] memory _input, uint256 _toPointer) internal pure {
      bytes32[] memory _genericArray;
      assembly {
        _genericArray := _input
      }
      TightCoder.encodeToLocation(
        _genericArray,
        _toPointer,
        ${element.staticByteLength},
        ${shiftLeftBits(element)}
      );
    }

    function encode(${element.internalTypeId}[] memory _input) internal pure returns (bytes memory _output) {
      _output = new bytes(_input.length * ${element.staticByteLength});
      uint256 _toPointer;
      assembly {
        _toPointer := add(_output, 0x20)
      }
      encodeToLocation(_input, _toPointer);
    }
  `.trim();
}
