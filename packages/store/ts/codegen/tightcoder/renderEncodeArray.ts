import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { staticAbiTypeToByteLength, staticAbiTypes } from "@latticexyz/schema-type";
import { renderTightCoderEncode } from "./renderFunctions";

export function renderEncodeArray() {
  let result = `${renderedSolidityHeader}
    import { TightCoder } from "./TightCoder.sol";
    library EncodeArray {
  `;

  for (const staticAbiType of staticAbiTypes) {
    const staticByteLength = staticAbiTypeToByteLength[staticAbiType];
    result += renderTightCoderEncode({ internalTypeId: staticAbiType, staticByteLength });
  }

  result += `
    }
  `;

  return result;
}
