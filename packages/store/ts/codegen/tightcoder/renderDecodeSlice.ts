import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { staticAbiTypeToByteLength, staticAbiTypes } from "@latticexyz/schema-type";
import { renderTightCoderDecode } from "./renderFunctions";

export function renderDecodeSlice() {
  return `
    ${renderedSolidityHeader}
    import { TightCoder } from "./TightCoder.sol";
    import { Slice } from "../Slice.sol";
    library DecodeSlice {
      ${staticAbiTypes
        .map((staticAbiType) =>
          renderTightCoderDecode({
            internalTypeId: staticAbiType,
            staticByteLength: staticAbiTypeToByteLength[staticAbiType],
          })
        )
        .join("\n")}
    }
  `;
}
