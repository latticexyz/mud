import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { staticAbiTypeToByteLength, staticAbiTypes } from "@latticexyz/schema-type/internal";
import { renderTightCoderDecode } from "./renderFunctions";

/**
 * Renders `DecodeSlice` library with the necessary header and imports,
 * which provides methods for decoding `Slice` into arrays of all primitive types
 * @returns string of Solidity code
 */
export function renderDecodeSlice() {
  return `
    ${renderedSolidityHeader}
    import { TightCoder } from "./TightCoder.sol";
    import { Slice } from "../Slice.sol";

    /**
     * @title DecodeSlice Library 
     * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
     * @notice A library for decoding slices of data into specific data types.
     * @dev This library provides functions for decoding slices into arrays of basic uint types.
     */
    library DecodeSlice {
      ${staticAbiTypes
        .map((staticAbiType) =>
          renderTightCoderDecode({
            internalTypeId: staticAbiType,
            staticByteLength: staticAbiTypeToByteLength[staticAbiType],
          }),
        )
        .join("\n")}
    }
  `;
}
