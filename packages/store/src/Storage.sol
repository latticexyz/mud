// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { leftMask } from "./Utils.sol";
import { Memory } from "./Memory.sol";

library Storage {
  function store(uint256 storagePointer, bytes32 data) internal {
    assembly {
      sstore(storagePointer, data)
    }
  }

  function store(uint256 storagePointer, uint256 offset, bytes memory data) internal {
    store(storagePointer, offset, Memory.dataPointer(data), data.length);
  }

  /**
   * Stores raw bytes to storage at the given storagePointer and offset (keeping the rest of the word intact)
   */
  function store(uint256 storagePointer, uint256 offset, uint256 memoryPointer, uint256 length) internal {
    if (offset > 0) {
      // Support offsets that are greater than 32 bytes by incrementing the storagePointer and decrementing the offset
      if (offset >= 32) {
        unchecked {
          storagePointer += offset / 32;
          offset %= 32;
        }
      }

      // For the first word, if there is an offset, apply a mask to beginning
      if (offset > 0) {
        // Get the word's remaining length after the offset
        uint256 wordRemainder;
        // (safe because of `offset %= 32` at the start)
        unchecked {
          wordRemainder = 32 - offset;
        }

        uint256 mask = leftMask(length);
        /// @solidity memory-safe-assembly
        assembly {
          // Load data from memory and offset it to match storage
          let bitOffset := mul(offset, 8)
          mask := shr(bitOffset, mask)
          let offsetData := shr(bitOffset, mload(memoryPointer))

          sstore(
            storagePointer,
            or(
              // Store the middle part
              and(offsetData, mask),
              // Preserve the surrounding parts
              and(sload(storagePointer), not(mask))
            )
          )
        }
        // Return if done
        if (length <= wordRemainder) return;

        // Advance pointers
        // (safe because of `length <= wordRemainder` earlier)
        unchecked {
          storagePointer += 1;
          memoryPointer += wordRemainder;
          length -= wordRemainder;
        }
      }
    }

    // Store full words
    while (length >= 32) {
      /// @solidity memory-safe-assembly
      assembly {
        sstore(storagePointer, mload(memoryPointer))
      }
      unchecked {
        storagePointer += 1;
        memoryPointer += 32;
        length -= 32;
      }
    }

    // For the last partial word, apply a mask to the end
    if (length > 0) {
      uint256 mask = leftMask(length);
      /// @solidity memory-safe-assembly
      assembly {
        sstore(
          storagePointer,
          or(
            // store the left part
            and(mload(memoryPointer), mask),
            // preserve the right part
            and(sload(storagePointer), not(mask))
          )
        )
      }
    }
  }

  function loadField(uint256 storagePointer, uint256 length, uint256 offset) internal view returns (bytes32 result) {
    if (offset >= 32) {
      unchecked {
        storagePointer += offset / 32;
        offset %= 32;
      }
    }
    assembly {
      result := shr(mul(sub(32, length), 8), shl(mul(offset, 8), sload(storagePointer)))
    }
  }

  function load(uint256 storagePointer) internal view returns (bytes32 word) {
    assembly {
      word := sload(storagePointer)
    }
  }

  /**
   * Load raw bytes from storage at the given storagePointer, offset, and length
   */
  function load(uint256 storagePointer, uint256 length, uint256 offset) internal view returns (bytes memory result) {
    uint256 memoryPointer;
    /// @solidity memory-safe-assembly
    assembly {
      // Solidity's YulUtilFunctions::roundUpFunction
      function round_up_to_mul_of_32(value) -> _result {
        _result := and(add(value, 31), not(31))
      }

      // Allocate memory
      result := mload(0x40)
      memoryPointer := add(result, 0x20)
      mstore(0x40, round_up_to_mul_of_32(add(memoryPointer, length)))
      // Store length
      mstore(result, length)
    }
    load(storagePointer, length, offset, memoryPointer);
    return result;
  }

  /**
   * Append raw bytes from storage at the given storagePointer, offset, and length to the given memoryPointer
   */
  function load(uint256 storagePointer, uint256 length, uint256 offset, uint256 memoryPointer) internal view {
    if (offset > 0) {
      // Support offsets that are greater than 32 bytes by incrementing the storagePointer and decrementing the offset
      if (offset >= 32) {
        unchecked {
          storagePointer += offset / 32;
          offset %= 32;
        }
      }

      // For the first word, if there is an offset, apply a mask to beginning
      if (offset > 0) {
        // Get the word's remaining length after the offset
        uint256 wordRemainder;
        // (safe because of `offset %= 32` at the start)
        unchecked {
          wordRemainder = 32 - offset;
        }

        uint256 mask = leftMask(wordRemainder);
        /// @solidity memory-safe-assembly
        assembly {
          // Load data from storage and offset it to match memory
          let offsetData := shl(mul(offset, 8), sload(storagePointer))

          mstore(
            memoryPointer,
            or(
              // store the middle part
              and(offsetData, mask),
              // preserve the surrounding parts
              and(mload(memoryPointer), not(mask))
            )
          )
        }
        // Return if done
        if (length <= wordRemainder) return;

        // Advance pointers
        // (safe because of `length <= wordRemainder` earlier)
        unchecked {
          storagePointer += 1;
          memoryPointer += wordRemainder;
          length -= wordRemainder;
        }
      }
    }

    // Load full words
    while (length >= 32) {
      /// @solidity memory-safe-assembly
      assembly {
        mstore(memoryPointer, sload(storagePointer))
      }
      unchecked {
        storagePointer += 1;
        memoryPointer += 32;
        length -= 32;
      }
    }

    // For the last partial word, apply a mask to the end
    if (length > 0) {
      uint256 mask = leftMask(length);
      /// @solidity memory-safe-assembly
      assembly {
        mstore(
          memoryPointer,
          or(
            // store the left part
            and(sload(storagePointer), mask),
            // preserve the right part
            and(mload(memoryPointer), not(mask))
          )
        )
      }
    }
  }
}
