import { renderedSolidityHeader } from "@latticexyz/common/codegen";

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
  `.trim();
}

export function renderTightCoderAutoTest() {
  let result = `${renderedSolidityHeader}

    import "forge-std/Test.sol";
    import { Bytes } from "../../src/Bytes.sol";
    import { EncodeArray } from "../../src/tightcoder/EncodeArray.sol";
    import { SliceLib } from "../../src/Slice.sol";

    contract TightCoderAutoTest is Test {
  `;

  for (const prefix of ["uint", "int", "bytes"]) {
    const [start, end, step] = prefix === "bytes" ? [1, 32, 1] : [8, 256, 8];
    result += `
      /************************************************************************
       *
       *    ${prefix}${start} - ${prefix}${end}
       *
       ************************************************************************/
    `;

    for (let i = start; i <= end; i += step) {
      const typeId = `${prefix}${i}`;
      result += renderTightCoderAutoTestFunction({ typeId });
    }
  }

  result += `
      /************************************************************************
       *
       *    Other types
       *
       ************************************************************************/

      ${renderTightCoderAutoTestFunction({ typeId: "address" })}

      ${renderTightCoderAutoTestFunction({ typeId: "bool" })}
    }
  `;

  return result;
}
