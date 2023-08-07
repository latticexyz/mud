import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { staticAbiTypeToByteLength, staticAbiTypes } from "@latticexyz/schema-type";
import { renderTightCoderDecode } from "./renderFunctions";

export function renderDecodeSlice() {
  let result = `${renderedSolidityHeader}
    import { TightCoder } from "./TightCoder.sol";
    import { Slice } from "../Slice.sol";
    library DecodeSlice {
  `;

  for (const staticAbiType of staticAbiTypes) {
    const staticByteLength = staticAbiTypeToByteLength[staticAbiType];
    result += renderTightCoderDecode({ internalTypeId: staticAbiType, staticByteLength });
  }

  result += `
    }
  `;

  return result;
}
