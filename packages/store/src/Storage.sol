// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { Utils } from "./Utils.sol";

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
    uint256 memoryPointer;
    assembly {
      memoryPointer := add(data, 0x20)
    }
    store(storagePointer, offset, memoryPointer, data.length);
  }

  /**
   * @notice Stores raw bytes to storage at the given storagePointer and offset (keeping the rest of the word intact)
   */
  function store(uint256 storagePointer, uint256 offset, uint256 memoryPointer, uint256 length) internal {
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

      uint256 mask = Utils.leftMask(length);
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
      storagePointer += 1;
      // (safe because of `length <= prefixLength` earlier)
      unchecked {
        memoryPointer += wordRemainder;
        length -= wordRemainder;
      }
    }

    // Store full words
    while (length >= 32) {
      /// @solidity memory-safe-assembly
      assembly {
        sstore(storagePointer, mload(memoryPointer))
      }
      storagePointer += 1;
      // (safe unless length is improbably large)
      unchecked {
        memoryPointer += 32;
        length -= 32;
      }
    }

    // For the last partial word, apply a mask to the end
    if (length > 0) {
      uint256 mask = Utils.leftMask(length);
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
    uint256 memoryPointer;
    assembly {
      memoryPointer := add(result, 0x20)
    }
    load(storagePointer, length, offset, memoryPointer);
    return result;
  }

  /**
   * @notice Append raw bytes from storage at the given storagePointer, offset, and length to the given memoryPointer
   */
  function load(uint256 storagePointer, uint256 length, uint256 offset, uint256 memoryPointer) internal view {
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

      uint256 mask = Utils.leftMask(wordRemainder);
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
      storagePointer += 1;
      // (safe because of `length <= prefixLength` earlier)
      unchecked {
        memoryPointer += wordRemainder;
        length -= wordRemainder;
      }
    }

    // Load full words
    while (length >= 32) {
      /// @solidity memory-safe-assembly
      assembly {
        mstore(memoryPointer, sload(storagePointer))
      }
      storagePointer += 1;
      // (safe unless length is improbably large)
      unchecked {
        memoryPointer += 32;
        length -= 32;
      }
    }

    // For the last partial word, apply a mask to the end
    if (length > 0) {
      uint256 mask = Utils.leftMask(length);
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
