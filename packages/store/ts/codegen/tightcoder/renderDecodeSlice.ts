import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { staticAbiTypeToByteLength, staticAbiTypes } from "@latticexyz/schema-type";
import { renderTightCoderDecode } from "./renderFunctions";

export function renderDecodeSlice() {
  return `
    ${renderedSolidityHeader}
    import { TightCoder } from "./TightCoder.sol";
    import { Slice } from "../Slice.sol";

    /**
     * @title DecodeSlice Library
     * @notice A library for decoding slices of data into specific data types.
     * @dev This library provides functions for decoding slices into arrays of basic uint types.
     */
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
