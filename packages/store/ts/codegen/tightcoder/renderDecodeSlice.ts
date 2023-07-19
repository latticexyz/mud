import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { renderTightCoderDecode } from "./renderFunctions";

export function renderDecodeSlice() {
  let result = `${renderedSolidityHeader}

    import { TightCoder } from "./TightCoder.sol";
    import { Slice } from "../Slice.sol";

    library DecodeSlice {
  `;

  for (const prefix of ["uint", "int", "bytes"]) {
    const [start, end, step, leftAligned] = prefix === "bytes" ? [1, 32, 1, true] : [8, 256, 8, false];
    result += `
      /************************************************************************
       *
       *    ${prefix}${start} - ${prefix}${end}
       *
       ************************************************************************/
    `;

    for (let i = start; i <= end; i += step) {
      const typeId = `${prefix}${i}`;
      result += renderTightCoderDecode({ typeId, elementSize: i / step, leftAligned });
    }
  }

  result += `
      /************************************************************************
       *
       *    Other types
       *
       ************************************************************************/

      // Note: internally address is right-aligned, like uint160
      ${renderTightCoderDecode({ typeId: "address", elementSize: 20, leftAligned: false })}

      ${renderTightCoderDecode({ typeId: "bool", elementSize: 1, leftAligned: false })}
    }
  `;

  return result;
}
