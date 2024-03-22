// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { BYTE_TO_BITS } from "./constants.sol";

/**
 * @title Byte Mask Utility
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice Utility functions to manage bytes in memory.
 * @dev Adapted from https://github.com/dk1a/solidity-stringutils/blob/main/src/utils/mem.sol#L149-L167
 */

/**
 * @notice Computes a right-aligned byte mask based on the provided byte length.
 * @dev The mask is used to extract a specified number of rightmost bytes.
 
 * @param byteLength The number of rightmost bytes to be masked.
 * @return mask A right-aligned byte mask corresponding to the specified byte length.
 */
function rightMask(uint256 byteLength) pure returns (uint256 mask) {
  unchecked {
    return type(uint256).max >> (byteLength * BYTE_TO_BITS);
  }
}
