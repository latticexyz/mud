// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { leftMask } from "./Utils.sol";
import { Memory } from "./Memory.sol";

/**
 * TODO Probably not fully optimized
 * (see https://github.com/latticexyz/mud/issues/444)
 */
library Storage {
  function store(uint256 storagePointer, bytes memory data) internal {
    store(storagePointer, 0, data);
  }

  function store(uint256 storagePointer, bytes32 data) internal {
    assembly {
      sstore(storagePointer, data)
    }
  }

  function store(uint256 storagePointer, uint256 offset, bytes memory data) internal {
    store(storagePointer, offset, Memory.dataPointer(data), data.length);
  }

  /**
   * @notice Stores raw bytes to storage at the given storagePointer and offset (keeping the rest of the word intact)
   */
  function store(uint256 storagePointer, uint256 offset, uint256 memoryPointer, uint256 length) internal {
    if (offset > 0) {
      // Support offsets that are greater than 32 bytes by incrementing the storagePointer and decrementing the offset
      unchecked {
        storagePointer += offset / 32;
        offset %= 32;
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

  function load(uint256 storagePointer) internal view returns (bytes32 word) {
    assembly {
      word := sload(storagePointer)
    }
  }

  function load(uint256 storagePointer, uint256 length) internal view returns (bytes memory) {
    return load(storagePointer, length, 0);
  }

  /**
   * @notice Load raw bytes from storage at the given storagePointer, offset, and length
   */
  function load(uint256 storagePointer, uint256 length, uint256 offset) internal view returns (bytes memory result) {
    // TODO this will probably use less gas via manual memory allocation
    // (see https://github.com/latticexyz/mud/issues/444)
    result = new bytes(length);
    load(storagePointer, length, offset, Memory.dataPointer(result));
    return result;
  }

  /**
   * @notice Append raw bytes from storage at the given storagePointer, offset, and length to the given memoryPointer
   */
  function load(uint256 storagePointer, uint256 length, uint256 offset, uint256 memoryPointer) internal view {
    if (offset > 0) {
      // Support offsets that are greater than 32 bytes by incrementing the storagePointer and decrementing the offset
      unchecked {
        storagePointer += offset / 32;
        offset %= 32;
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
