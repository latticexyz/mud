import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { staticAbiTypeToByteLength, staticAbiTypes } from "@latticexyz/schema-type";
import { renderTightCoderEncode } from "./renderFunctions";

export function renderEncodeArray() {
  return `
    ${renderedSolidityHeader}
    import { TightCoder } from "./TightCoder.sol";
    import { Slice } from "../Slice.sol";
    library EncodeArray {
      ${staticAbiTypes
        .map((staticAbiType) =>
          renderTightCoderEncode({
            internalTypeId: staticAbiType,
            staticByteLength: staticAbiTypeToByteLength[staticAbiType],
          })
        )
        .join("\n")}
      }
  `;
}
