import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { staticAbiTypes } from "@latticexyz/schema-type";

export function renderTightCoderAutoTestFunction({ typeId }: { typeId: string }) {
  return `
    function testEncodeDecodeArray_${typeId}(
      ${typeId} val0,
      ${typeId} val1,
      ${typeId} val2
    ) public {
      ${typeId}[] memory input = new ${typeId}[](3);
      input[0] = val0;
      input[1] = val1;
      input[2] = val2;

      bytes memory encoded = EncodeArray.encode(input);
      assertEq(encoded, abi.encodePacked(val0, val1, val2));

      ${typeId}[] memory decoded = SliceLib.fromBytes(encoded).decodeArray_${typeId}();
      assertEq(decoded.length, 3);
      assertEq(decoded[0], val0);
      assertEq(decoded[1], val1);
      assertEq(decoded[2], val2);
    }
  `;
}

export function renderTightCoderAutoTest() {
  return `
    ${renderedSolidityHeader}

    import { Test } from "forge-std/Test.sol";
    import { EncodeArray } from "../../src/tightcoder/EncodeArray.sol";
    import { SliceLib } from "../../src/Slice.sol";

    contract TightCoderAutoTest is Test {
      ${staticAbiTypes.map((staticAbiType) => renderTightCoderAutoTestFunction({ typeId: staticAbiType })).join("")}
    }
  `;
}
