// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Utils } from "./Utils.sol";
import { Bytes } from "./Bytes.sol";
import { Memory } from "./Memory.sol";
import "./Buffer.sol";

library Storage {
  function write(bytes32 storagePointer, bytes memory data) internal {
    write(uint256(storagePointer), 0, data);
  }

  function write(uint256 storagePointer, bytes memory data) internal {
    write(storagePointer, 0, data);
  }

  function write(bytes32 storagePointer, bytes32 data) internal {
    _writeWord(uint256(storagePointer), data);
  }

  function write(uint256 storagePointer, bytes32 data) internal {
    _writeWord(storagePointer, data);
  }

  function write(
    bytes32 storagePointer,
    uint256 offset,
    bytes memory data
  ) internal {
    write(uint256(storagePointer), offset, data);
  }

  function write(
    uint256 storagePointer,
    uint256 offset,
    bytes memory data
  ) internal {
    uint256 memoryPointer;
    assembly {
      memoryPointer := add(data, 0x20)
    }
    write(storagePointer, offset, memoryPointer, data.length);
  }

  function write(
    bytes32 storagePointer,
    uint256 offset,
    uint256 memoryPointer,
    uint256 length
  ) internal {
    write(uint256(storagePointer), offset, memoryPointer, length);
  }

  /**
   * @dev Write raw bytes to storage at the given storagePointer and offset (keeping the rest of the word intact)
   * TODO: this implementation is optimized for readability, but not very gas efficient. We should optimize this using assembly once we've settled on a spec.
   */
  function write(
    uint256 storagePointer,
    uint256 offset,
    uint256 memoryPointer,
    uint256 length
  ) internal {
    uint256 numWords = Utils.divCeil(length + offset, 32);
    uint256 bytesWritten;

    for (uint256 i; i < numWords; i++) {
      // If this is the first word, and there is an offset, apply a mask to beginning
      if ((i == 0 && offset > 0)) {
        uint256 _length = length > 32 ? 32 - offset : length; // // the number of bytes to write
        _writePartialWord(
          storagePointer, // the word to update
          offset, // the offset in bytes to start writing
          _length,
          Memory.read(memoryPointer) // Pass the first 32 bytes of the data
        );
        bytesWritten += _length;
        // If this is the last word, and there is a partial word, apply a mask to the end
      } else if (i == numWords - 1 && (length + offset) % 32 > 0) {
        _writePartialWord(
          storagePointer + i, // the word to update
          0, // the offset in bytes to start writing
          (length + offset) % 32, // the number of bytes to write
          Memory.read(memoryPointer, bytesWritten) // the data to write
        );

        // Else, just write the word
      } else {
        _writeWord(storagePointer + i, Memory.read(memoryPointer, bytesWritten));
        bytesWritten += 32;
      }
    }
  }

  function read(bytes32 storagePointer) internal view returns (bytes32) {
    return _loadWord(uint256(storagePointer));
  }

  function read(uint256 storagePointer) internal view returns (bytes32) {
    return _loadWord(storagePointer);
  }

  function read(bytes32 storagePointer, uint256 length) internal view returns (bytes memory) {
    return read(uint256(storagePointer), 0, length);
  }

  function read(uint256 storagePointer, uint256 length) internal view returns (bytes memory) {
    return read(storagePointer, 0, length);
  }

  function read(
    bytes32 storagePointer,
    uint256 offset,
    uint256 length
  ) internal view returns (bytes memory) {
    return read(uint256(storagePointer), offset, length);
  }

  /**
   * @dev Read raw bytes from storage at the given storagePointer, offset, and length
   */
  function read(
    uint256 storagePointer,
    uint256 offset,
    uint256 length
  ) internal view returns (bytes memory) {
    Buffer buf = Buffer_.allocate(uint128(length));
    read(storagePointer, offset, length, buf);
    return buf.toBytes();
  }

  /**
   * @dev Append raw bytes from storage at the given storagePointer, offset, and length to the given buffer
   */
  function read(
    uint256 storagePointer,
    uint256 offset,
    uint256 length,
    Buffer buf
  ) internal view {
    uint256 numWords = Utils.divCeil(length + offset, 32);
    uint256 _length;

    for (uint256 i; i < numWords; i++) {
      // If this is the first word, and there is an offset, apply a mask to beginning (and possibly the end if length + offset is less than 32)
      if ((i == 0 && offset > 0)) {
        _length = length > 32 ? 32 - offset : length; // the number of bytes to read
        buf.appendUnchecked(
          _loadPartialWord(
            storagePointer, // the slot to start loading from
            offset, // the offset in bytes to start reading from
            _length
          ),
          uint128(_length)
        );

        // If this is the last word, and there is a partial word, apply a mask to the end
      } else if (i == numWords - 1 && (length + offset) % 32 > 0) {
        _length = (length + offset) % 32; //  the relevant length of the trailing word
        buf.appendUnchecked(
          _loadPartialWord(
            storagePointer + i, // the word to read from
            0, // the offset in bytes to start reading from
            _length
          ),
          uint128(_length)
        );

        // Else, just read the word
      } else {
        buf.appendUnchecked(_loadWord(storagePointer + i), 32);
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

  function _writeWord(uint256 storagePointer, bytes32 data) internal {
    assembly {
      sstore(storagePointer, data)
    }
  }

  function _writePartialWord(
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
