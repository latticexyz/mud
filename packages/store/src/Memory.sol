// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { rightMask } from "./rightMask.sol";

/**
 * @title Memory Operations
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
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
   * @dev Length does not have to be a multiple of 32, mcopy safely handles unaligned words.
   * Copying takes place as if an intermediate buffer was used, allowing the destination and source to overlap.
   * @param fromPointer The memory location to copy from.
   * @param toPointer The memory location to copy to.
   * @param length The number of bytes to copy.
   */
  function copy(uint256 fromPointer, uint256 toPointer, uint256 length) internal pure {
    /// @solidity memory-safe-assembly
    assembly {
      mcopy(toPointer, fromPointer, length)
    }
  }
}
