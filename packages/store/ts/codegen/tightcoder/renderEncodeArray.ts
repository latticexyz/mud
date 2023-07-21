import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { renderTightCoderEncode } from "./renderFunctions";

export function renderEncodeArray() {
  let result = `${renderedSolidityHeader}

    import { TightCoder } from "./TightCoder.sol";

    library EncodeArray {
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
      result += renderTightCoderEncode({ internalTypeId, staticByteLength: i / step });
    }
  }

  result += `
      /************************************************************************
       *
       *    Other types
       *
       ************************************************************************/

      // Note: internally address is right-aligned, like uint160
      ${renderTightCoderEncode({ internalTypeId: "address", staticByteLength: 20 })}

      ${renderTightCoderEncode({ internalTypeId: "bool", staticByteLength: 1 })}
    }
  `;

  return result;
}
