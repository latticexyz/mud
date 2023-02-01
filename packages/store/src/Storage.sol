// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { Utils } from "./Utils.sol";
import { Bytes } from "./Bytes.sol";
import { Memory } from "./Memory.sol";
import "./Buffer.sol";

library Storage {
  function store(bytes32 storagePointer, bytes memory data) internal {
    store(uint256(storagePointer), 0, data);
  }

  function store(uint256 storagePointer, bytes memory data) internal {
    store(storagePointer, 0, data);
  }

  function store(bytes32 storagePointer, bytes32 data) internal {
    _storeWord(uint256(storagePointer), data);
  }

  function store(uint256 storagePointer, bytes32 data) internal {
    _storeWord(storagePointer, data);
  }

  function store(
    bytes32 storagePointer,
    uint256 offset,
    bytes memory data
  ) internal {
    store(uint256(storagePointer), offset, data);
  }

  function store(
    uint256 storagePointer,
    uint256 offset,
    bytes memory data
  ) internal {
    uint256 memoryPointer;
    assembly {
      memoryPointer := add(data, 0x20)
    }
    store(storagePointer, offset, memoryPointer, data.length);
  }

  function store(
    bytes32 storagePointer,
    uint256 offset,
    uint256 memoryPointer,
    uint256 length
  ) internal {
    store(uint256(storagePointer), offset, memoryPointer, length);
  }

  /**
   * @dev store raw bytes to storage at the given storagePointer and offset (keeping the rest of the word intact)
   * TODO: this implementation is optimized for readability, but not very gas efficient. We should optimize this using assembly once we've settled on a spec.
   */
  function store(
    uint256 storagePointer,
    uint256 offset,
    uint256 memoryPointer,
    uint256 length
  ) internal {
    // Support offsets that are greater than 32 bytes by incrementing the storagePointer and decrementing the offset
    storagePointer += offset / 32;
    offset %= 32;

    uint256 numWords = Utils.divCeil(length + offset, 32);
    uint256 bytesWritten;

    for (uint256 i; i < numWords; i++) {
      // If this is the first word, and there is an offset, apply a mask to beginning
      if ((i == 0 && offset > 0)) {
        uint256 _lengthTostore = length + offset > 32 ? 32 - offset : length; // // the number of bytes to store
        _storePartialWord(
          storagePointer, // the word to update
          offset, // the offset in bytes to start writing
          _lengthTostore,
          Memory.load(memoryPointer) // Pass the first 32 bytes of the data
        );
        bytesWritten += _lengthTostore;
        // If this is the last word, and there is a partial word, apply a mask to the end
      } else if (i == numWords - 1 && (length + offset) % 32 > 0) {
        _storePartialWord(
          storagePointer + i, // the word to update
          0, // the offset in bytes to start writing
          (length + offset) % 32, // the number of bytes to store
          Memory.load(memoryPointer, bytesWritten) // the data to store
        );

        // Else, just store the word
      } else {
        _storeWord(storagePointer + i, Memory.load(memoryPointer, bytesWritten));
        bytesWritten += 32;
      }
    }
  }

  function load(bytes32 storagePointer) internal view returns (bytes32) {
    return _loadWord(uint256(storagePointer));
  }

  function load(uint256 storagePointer) internal view returns (bytes32) {
    return _loadWord(storagePointer);
  }

  function load(bytes32 storagePointer, uint256 length) internal view returns (bytes memory) {
    return load(uint256(storagePointer), 0, length);
  }

  function load(uint256 storagePointer, uint256 length) internal view returns (bytes memory) {
    return load(storagePointer, 0, length);
  }

  function load(
    bytes32 storagePointer,
    uint256 offset,
    uint256 length
  ) internal view returns (bytes memory) {
    return load(uint256(storagePointer), offset, length);
  }

  /**
   * @dev load raw bytes from storage at the given storagePointer, offset, and length
   */
  function load(
    uint256 storagePointer,
    uint256 offset,
    uint256 length
  ) internal view returns (bytes memory) {
    Buffer buffer = Buffer_.allocate(uint128(length));
    load(storagePointer, offset, length, buffer);
    return buffer.toBytes();
  }

  /**
   * @dev Append raw bytes from storage at the given storagePointer, offset, and length to the given buffer
   */
  function load(
    uint256 storagePointer,
    uint256 offset,
    uint256 length,
    Buffer buffer
  ) internal view {
    // Support offsets that are greater than 32 bytes by incrementing the storagePointer and decrementing the offset
    storagePointer += offset / 32;
    offset %= 32;

    uint256 numWords = Utils.divCeil(length + offset, 32);
    uint256 _lengthToload;

    for (uint256 i; i < numWords; i++) {
      // If this is the first word, and there is an offset, apply a mask to beginning (and possibly the end if length + offset is less than 32)
      if ((i == 0 && offset > 0)) {
        _lengthToload = length + offset > 32 ? 32 - offset : length; // the number of bytes to load
        buffer.appendUnchecked(
          _loadPartialWord(
            storagePointer, // the slot to start loading from
            offset, // the offset in bytes to start loading from
            _lengthToload
          ),
          uint128(_lengthToload)
        );

        // If this is the last word, and there is a partial word, apply a mask to the end
      } else if (i == numWords - 1 && (length + offset) % 32 > 0) {
        _lengthToload = (length + offset) % 32; //  the relevant length of the trailing word
        buffer.appendUnchecked(
          _loadPartialWord(
            storagePointer + i, // the word to load from
            0, // the offset in bytes to start loading from
            _lengthToload
          ),
          uint128(_lengthToload)
        );

        // Else, just load the word
      } else {
        buffer.appendUnchecked(_loadWord(storagePointer + i), 32);
      }
    }
  }

  /**
   * @dev Load a full word from storage into memory
   */
  function _loadWord(uint256 storagePointer) internal view returns (bytes32 data) {
    assembly {
      data := sload(storagePointer)
    }
  }

  /**
   * @dev Load a partial word from storage into memory
   */
  function _loadPartialWord(
    uint256 storagePointer,
    uint256 offset,
    uint256 length
  ) internal view returns (bytes32) {
    // Load current value from storage
    bytes32 storageValue;
    assembly {
      storageValue := sload(storagePointer)
    }

    // create a mask for the bits we want to update
    return (storageValue << (offset * 8)) & bytes32(Utils.leftMask(length * 8));
  }

  function _storeWord(uint256 storagePointer, bytes32 data) internal {
    assembly {
      sstore(storagePointer, data)
    }
  }

  function _storePartialWord(
    uint256 storagePointer,
    uint256 offset, // in bytes
    uint256 length, // in bytes
    bytes32 data
  ) internal {
    bytes32 current;
    assembly {
      current := sload(storagePointer)
    }
    bytes32 mask = bytes32(Utils.leftMask(length * 8) >> (offset * 8)); // create a mask for the bits we want to update
    bytes32 updated = (current & ~mask) | ((data >> (offset * 8)) & mask); // apply mask to data
    assembly {
      sstore(storagePointer, updated)
    }
  }
}
