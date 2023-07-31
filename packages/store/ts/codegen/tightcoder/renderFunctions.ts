import { shiftLeftBits } from "@latticexyz/common/codegen";

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
        ${shiftLeftBits(element)}
      );
      assembly {
        _output := _genericArray
      }
    }
  `.trim();
}

export function renderTightCoderEncode(element: { internalTypeId: string; staticByteLength: number }) {
  return `
    function encode(${element.internalTypeId}[] memory _input) internal pure returns (bytes memory) {
      bytes32[] memory _genericArray;
      assembly {
        _genericArray := _input
      }
      return TightCoder.encode(
        _genericArray,
        ${element.staticByteLength},
        ${shiftLeftBits(element)}
      );
    }
  `.trim();
}
