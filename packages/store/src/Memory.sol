// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { rightMask } from "./rightMask.sol";

/**
 * @title Memory Operations
 * @notice A library for performing low-level memory operations.
 * @dev This library provides low-level memory operations with safety checks.
 */
library Memory {
  /**
   * @notice Gets the actual data pointer of dynamic arrays.
   * @dev In dynamic arrays, the first word stores the length of the data, after which comes the actual data.
   * Example: 0x40 0x01 0x02
   *          ^len ^data
   * @param data The dynamic bytes data from which to get the pointer.
   * @return memoryPointer The pointer to the actual data (skipping the length).
   */
  function dataPointer(bytes memory data) internal pure returns (uint256 memoryPointer) {
    assembly {
      memoryPointer := add(data, 0x20)
    }
  }

  /**
   * @notice Copies memory from one location to another.
   * @dev Safely copies memory in chunks of 32 bytes, then handles any residual bytes.
   * @param fromPointer The memory location to copy from.
   * @param toPointer The memory location to copy to.
   * @param length The number of bytes to copy.
   */
  function copy(uint256 fromPointer, uint256 toPointer, uint256 length) internal view {
    // Copy 32-byte chunks
    while (length >= 32) {
      // Use the identity precompile to copy 32 bytes
      assembly {
        let success := staticcall(gas(), 0x04, fromPointer, 32, toPointer, 32)
        if iszero(success) {
          revert(0, 0)
        }
      }
      toPointer += 32;
      fromPointer += 32;
      length -= 32;
    }

    if (length > 0) {
      // Use the identity precompile to copy the remaining bytes
      assembly {
        let success := staticcall(gas(), 0x04, fromPointer, length, toPointer, length)
        if iszero(success) {
          revert(0, 0)
        }
      }
    }
  }
}
