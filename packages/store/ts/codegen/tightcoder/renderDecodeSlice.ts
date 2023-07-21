import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { renderTightCoderDecode } from "./renderFunctions";

export function renderDecodeSlice() {
  let result = `${renderedSolidityHeader}

    import { TightCoder } from "./TightCoder.sol";
    import { Slice } from "../Slice.sol";

    library DecodeSlice {
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
      const internalTypeId = `${prefix}${i}`;
      result += renderTightCoderDecode({ internalTypeId, staticByteLength: i / step });
    }
  }

  result += `
      /************************************************************************
       *
       *    Other types
       *
       ************************************************************************/

      // Note: internally address is right-aligned, like uint160
      ${renderTightCoderDecode({ internalTypeId: "address", staticByteLength: 20 })}

      ${renderTightCoderDecode({ internalTypeId: "bool", staticByteLength: 1 })}
    }
  `;

  return result;
}
