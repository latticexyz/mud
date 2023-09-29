// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { leftMask } from "./leftMask.sol";
import { Memory } from "./Memory.sol";

/**
 * @title Storage Library
 * @dev Provides functions for low-level storage manipulation, including storing and retrieving bytes.
 */
library Storage {
  /**
   * @notice Store a single word of data at a specific storage pointer.
   * @param storagePointer The location to store the data.
   * @param data The 32-byte word of data to store.
   */
  function store(uint256 storagePointer, bytes32 data) internal {
    assembly {
      sstore(storagePointer, data)
    }
  }

  /**
   * @notice Store bytes of data at a specific storage pointer and offset.
   * @param storagePointer The base storage location.
   * @param offset Offset within the storage location.
   * @param data Bytes to store.
   */
  function store(uint256 storagePointer, uint256 offset, bytes memory data) internal {
    store(storagePointer, offset, Memory.dataPointer(data), data.length);
  }

  /**
   * @notice Stores raw bytes to storage at a given pointer, offset, and length, keeping the rest of the word intact.
   * @param storagePointer The base storage location.
   * @param offset Offset within the storage location.
   * @param memoryPointer Pointer to the start of the data in memory.
   * @param length Length of the data in bytes.
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

  /**
   * @notice Set multiple storage locations to zero.
   * @param storagePointer The starting storage location.
   * @param length The number of storage locations to set to zero.
   */
  function zero(uint256 storagePointer, uint256 length) internal {
    // Ceil division to round up to the nearest word
    uint256 limit = storagePointer + (length + 31) / 32;
    while (storagePointer < limit) {
      /// @solidity memory-safe-assembly
      assembly {
        sstore(storagePointer, 0)
        storagePointer := add(storagePointer, 1)
      }
    }
  }

  /**
   * @notice Load a single word of data from a specific storage pointer.
   * @param storagePointer The location to load the data from.
   * @return word The loaded 32-byte word of data.
   */
  function load(uint256 storagePointer) internal view returns (bytes32 word) {
    assembly {
      word := sload(storagePointer)
    }
  }

  /**
   * @notice Load raw bytes from storage at a given pointer, offset, and length.
   * @param storagePointer The base storage location.
   * @param length Length of the data in bytes.
   * @param offset Offset within the storage location.
   * @return result The loaded bytes of data.
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
   * @notice Append raw bytes from storage at a given pointer, offset, and length to a specific memory pointer.
   * @param storagePointer The base storage location.
   * @param length Length of the data in bytes.
   * @param offset Offset within the storage location.
   * @param memoryPointer Pointer to the location in memory to append the data.
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

  /**
   * @notice Load up to 32 bytes from storage at a given pointer and offset.
   * @dev Since fields are tightly packed, they can span more than one slot.
   * Since the they're max 32 bytes, they can span at most 2 slots.
   * @param storagePointer The base storage location.
   * @param length Length of the data in bytes.
   * @param offset Offset within the storage location.
   * @return result The loaded bytes, left-aligned bytes. Bytes beyond the length are zeroed.
   */
  function loadField(uint256 storagePointer, uint256 length, uint256 offset) internal view returns (bytes32 result) {
    if (offset >= 32) {
      unchecked {
        storagePointer += offset / 32;
        offset %= 32;
      }
    }

    // Extra data past length is not truncated
    // This assumes that the caller will handle the overflow bits appropriately
    assembly {
      result := shl(mul(offset, 8), sload(storagePointer))
    }

    uint256 wordRemainder;
    // (safe because of `offset %= 32` at the start)
    unchecked {
      wordRemainder = 32 - offset;
    }

    // Read from the next slot if field spans 2 slots
    if (length > wordRemainder) {
      assembly {
        result := or(result, shr(mul(wordRemainder, 8), sload(add(storagePointer, 1))))
      }
    }
  }
}
