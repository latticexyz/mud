// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/**
 * @title Bytes
 * @notice Utility functions for bytes.
 */
library Bytes {
  /************************************************************************
   *
   *    UTILS
   *
   ************************************************************************/

  /**
   * @dev Sets the length of a bytes blob in memory.
   * This function does not resize the memory allocation; it only changes the length
   * field, which affects operations that access the length property.
   * @param input The bytes blob to modify.
   * @param length The new length to set.
   * @return Reference to the input bytes blob with modified length.
   */
  function setLength(bytes memory input, uint256 length) internal pure returns (bytes memory) {
    assembly {
      mstore(input, length)
    }
    return input;
  }

  /************************************************************************
   *
   *    SET
   *
   ************************************************************************/

  /**
   * @dev Sets a specific 4-byte sequence in a bytes blob at a given index.
   * @param input The bytes blob in which a specific 4-byte sequence is to be altered.
   * @param index The position within the bytes blob to start altering the 4-byte sequence. Index starts from the left.
   * @param overwrite The new 4-byte value to be set at the specified index.
   * @return The modified bytes blob with the new 4-byte value at the specified index.
   */
  function setBytes4(bytes memory input, uint256 index, bytes4 overwrite) internal pure returns (bytes memory) {
    bytes4 mask = 0xffffffff;
    assembly {
      let value := mload(add(add(input, 0x20), index)) // load 32 bytes from input starting at offset
      value := and(value, not(mask)) // zero out the first 4 bytes
      value := or(value, overwrite) // set the bytes at the offset
      mstore(add(add(input, 0x20), index), value) // store the new value
    }
    return input;
  }

  /************************************************************************
   *
   *    SLICE
   *
   ************************************************************************/

  /**
   * @dev Extracts a single byte from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a byte is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes1 value from the specified position in the bytes blob.
   */
  function slice1(bytes memory data, uint256 start) internal pure returns (bytes1 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a single byte from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a byte is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes1 value from the specified position in the bytes32 value.
   */
  function slice1(bytes32 data, uint256 start) internal pure returns (bytes1 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 2-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 2-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes2 value from the specified position in the bytes blob.
   */
  function slice2(bytes memory data, uint256 start) internal pure returns (bytes2 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 2-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 2-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes2 value from the specified position in the bytes32 value.
   */
  function slice2(bytes32 data, uint256 start) internal pure returns (bytes2 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 4-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 4-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes4 value from the specified position in the bytes blob.
   */
  function slice4(bytes memory data, uint256 start) internal pure returns (bytes4 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 5-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 5-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes5 value from the specified position in the bytes blob.
   */
  function slice5(bytes memory data, uint256 start) internal pure returns (bytes5 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 8-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 8-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes8 value from the specified position in the bytes blob.
   */
  function slice8(bytes memory data, uint256 start) internal pure returns (bytes8 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 16-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 16-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes16 value from the specified position in the bytes blob.
   */
  function slice16(bytes memory data, uint256 start) internal pure returns (bytes16 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 20-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 20-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes20 value from the specified position in the bytes blob.
   */
  function slice20(bytes memory data, uint256 start) internal pure returns (bytes20 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 32-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 32-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes32 value from the specified position in the bytes blob.
   */
  function slice32(bytes memory data, uint256 start) internal pure returns (bytes32 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }
}
