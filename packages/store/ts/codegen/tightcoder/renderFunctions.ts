export type RenderTighcoderOptions = {
  typeId: string;
  elementSize: number;
  leftAligned: boolean;
};

export function renderTightCoderDecode({ typeId, elementSize, leftAligned }: RenderTighcoderOptions) {
  return `
    function decodeArray_${typeId}(Slice _input) internal pure returns (${typeId}[] memory _output) {
      bytes32[] memory _genericArray = TightCoder.decode(_input, ${elementSize}, ${leftAligned});
      assembly {
        _output := _genericArray
      }
    }
  `.trim();
}

export function renderTightCoderEncode({ typeId, elementSize, leftAligned }: RenderTighcoderOptions) {
  return `
    function encode(${typeId}[] memory _input) internal pure returns (bytes memory _output) {
      bytes32[] memory _genericArray;
      assembly {
        _genericArray := _input
      }
      return TightCoder.encode(_genericArray, ${elementSize}, ${leftAligned});
    }
  `.trim();
}
