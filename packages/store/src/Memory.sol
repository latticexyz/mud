// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { leftMask } from "./Utils.sol";

library Memory {
  /**
   * In dynamic arrays the first word stores the length of data, after which comes data.
   * Example: 0x40 0x01 0x02
   *          ^len ^data
   */
  function dataPointer(bytes memory data) internal pure returns (uint256 memoryPointer) {
    assembly {
      memoryPointer := add(data, 0x20)
    }
  }

  function copy(uint256 fromPointer, uint256 toPointer, uint256 length) internal pure {
    // copy 32-byte chunks
    while (length >= 32) {
      /// @solidity memory-safe-assembly
      assembly {
        mstore(toPointer, mload(fromPointer))
      }
      // safe because total addition will be <= length (ptr+len is implicitly safe)
      unchecked {
        toPointer += 32;
        fromPointer += 32;
        length -= 32;
      }
    }
    // copy the 0-31 length tail
    // (the rest is an inlined `mstoreN`)
    uint256 mask = leftMask(length);
    /// @solidity memory-safe-assembly
    assembly {
      mstore(
        toPointer,
        or(
          // store the left part
          and(mload(fromPointer), mask),
          // preserve the right part
          and(mload(toPointer), not(mask))
        )
      )
    }
  }
}
