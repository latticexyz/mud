// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/**
 * @title Byte Mask Utility
 * @notice Utility functions to manage bytes in memory.
 * @dev Adapted from https://github.com/dk1a/solidity-stringutils/blob/main/src/utils/mem.sol#L149-L167
 */

/**
 * @notice Computes a left-aligned byte mask based on the provided byte length.
 * @dev The mask is used to extract a specified number of leftmost bytes.
 *      For byte lengths greater than or equal to 32, it returns the max value of type(uint256).
 *      Examples:
 *          length 0:   0x000000...000000
 *          length 1:   0xff0000...000000
 *          length 2:   0xffff00...000000
 *          ...
 *          length 30:  0xffffff...ff0000
 *          length 31:  0xffffff...ffff00
 *          length 32+: 0xffffff...ffffff
 * @param byteLength The number of leftmost bytes to be masked.
 * @return mask A left-aligned byte mask corresponding to the specified byte length.
 */
function leftMask(uint256 byteLength) pure returns (uint256 mask) {
  unchecked {
    return ~(type(uint256).max >> (byteLength * 8));
  }
}
