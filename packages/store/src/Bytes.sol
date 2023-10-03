// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/**
 * @title Bytes
 * @notice Utility functions for bytes.
 */
library Bytes {
  /**
   * @dev Converts a `bytes` memory blob to a single `bytes32` memory value, starting at the given byte offset.
   * @param input The `bytes` blob to read from.
   * @param offset The byte offset at which to start reading.
   * @return output The `bytes32` value.
   */
  function toBytes32(bytes memory input, uint256 offset) internal pure returns (bytes32 output) {
    assembly {
      // input is a pointer to the start of the bytes array
      // in memory, the first 32 bytes are the length of the array
      // so we add 32 to the pointer to get to the start of the data
      // then we add the start offset to get to the start of the desired word
      output := mload(add(input, add(0x20, offset)))
    }
  }

  /************************************************************************
   *
   *    UTILS
   *
   ************************************************************************/

  /**
   * @dev Compares two bytes blobs for equality.
   * @param a First bytes blob.
   * @param b Second bytes blob.
   * @return True if the two bytes blobs are equal, false otherwise.
   */
  function equals(bytes memory a, bytes memory b) internal pure returns (bool) {
    if (a.length != b.length) {
      return false;
    }
    return keccak256(a) == keccak256(b);
  }

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
   * @dev Sets a specific byte in a bytes32 value.
   * @param input The bytes32 data in which a specific byte is to be altered.
   * @param index The position of the byte to be altered. Index starts from the left.
   * @param overwrite The new byte value to be set at the specified index.
   * @return output The modified bytes32 data with the new byte value at the specified index.
   */
  function setBytes1(bytes32 input, uint256 index, bytes1 overwrite) internal pure returns (bytes32 output) {
    bytes1 mask = 0xff;
    assembly {
      mask := shr(mul(8, index), mask) // create a mask by shifting 0xff right by index bytes
      output := and(input, not(mask)) // zero out the byte at index
      output := or(output, shr(mul(8, index), overwrite)) // set the byte at index
    }
    return output;
  }

  /**
   * @dev Sets a specific 2-byte sequence in a bytes32 variable.
   * @param input The bytes32 data in which a specific 2-byte sequence is to be altered.
   * @param index The position of the 2-byte sequence to be altered. Index starts from the left.
   * @param overwrite The new 2-byte value to be set at the specified index.
   * @return output The modified bytes32 data with the new 2-byte value at the specified index.
   */
  function setBytes2(bytes32 input, uint256 index, bytes2 overwrite) internal pure returns (bytes32 output) {
    bytes2 mask = 0xffff;
    assembly {
      mask := shr(mul(8, index), mask) // create a mask by shifting 0xffff right by index bytes
      output := and(input, not(mask)) // zero out the byte at index
      output := or(output, shr(mul(8, index), overwrite)) // set the byte at index
    }
    return output;
  }

  /**
   * @dev Sets a specific 4-byte sequence in a bytes32 variable.
   * @param input The bytes32 data in which a specific 4-byte sequence is to be altered.
   * @param index The position of the 4-byte sequence to be altered. Index starts from the left.
   * @param overwrite The new 4-byte value to be set at the specified index.
   * @return output The modified bytes32 data with the new 4-byte value at the specified index.
   */
  function setBytes4(bytes32 input, uint256 index, bytes4 overwrite) internal pure returns (bytes32 output) {
    bytes4 mask = 0xffffffff;
    assembly {
      mask := shr(mul(8, index), mask) // create a mask by shifting 0xffffffff right by index bytes
      output := and(input, not(mask)) // zero out the byte at index
      output := or(output, shr(mul(8, index), overwrite)) // set the byte at index
    }
    return output;
  }

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

  /**
   * @dev Sets a specific 5-byte sequence in a bytes32 variable.
   * @param input The bytes32 data in which a specific 5-byte sequence is to be altered.
   * @param index The position of the 5-byte sequence to be altered. Index starts from the left.
   * @param overwrite The new 5-byte value to be set at the specified index.
   * @return output The modified bytes32 data with the new 5-byte value at the specified index.
   */
  function setBytes5(bytes32 input, uint256 index, bytes5 overwrite) internal pure returns (bytes32 output) {
    bytes5 mask = bytes5(type(uint40).max);
    assembly {
      mask := shr(mul(8, index), mask) // create a mask by shifting 0xff...ff right by index bytes
      output := and(input, not(mask)) // zero out the byte at index
      output := or(output, shr(mul(8, index), overwrite)) // set the byte at index
    }
    return output;
  }

  /**
   * @dev Sets a specific 7-byte sequence in a bytes32 variable.
   * @param input The bytes32 data in which a specific 7-byte sequence is to be altered.
   * @param index The position of the 7-byte sequence to be altered. Index starts from the left.
   * @param overwrite The new 7-byte value to be set at the specified index.
   * @return output The modified bytes32 data with the new 7-byte value at the specified index.
   */
  function setBytes7(bytes32 input, uint256 index, bytes7 overwrite) internal pure returns (bytes32 output) {
    bytes7 mask = bytes7(type(uint56).max);
    assembly {
      mask := shr(mul(8, index), mask) // create a mask by shifting 0xff...ff right by index bytes
      output := and(input, not(mask)) // zero out the byte at index
      output := or(output, shr(mul(8, index), overwrite)) // set the byte at index
    }
    return output;
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
   * @return The extracted bytes1 value from the specified position in the bytes blob.
   */
  function slice1(bytes memory data, uint256 start) internal pure returns (bytes1) {
    bytes1 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a single byte from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a byte is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return The extracted bytes1 value from the specified position in the bytes32 value.
   */
  function slice1(bytes32 data, uint256 start) internal pure returns (bytes1) {
    bytes1 output;
    assembly {
      output := shl(mul(8, start), data)
    }
    return output;
  }

  /**
   * @dev Extracts a 2-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 2-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes2 value from the specified position in the bytes blob.
   */
  function slice2(bytes memory data, uint256 start) internal pure returns (bytes2) {
    bytes2 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 2-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 2-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return The extracted bytes2 value from the specified position in the bytes32 value.
   */
  function slice2(bytes32 data, uint256 start) internal pure returns (bytes2) {
    bytes2 output;
    assembly {
      output := shl(mul(8, start), data)
    }
    return output;
  }

  /**
   * @dev Extracts a 3-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 3-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes3 value from the specified position in the bytes blob.
   */
  function slice3(bytes memory data, uint256 start) internal pure returns (bytes3) {
    bytes3 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 4-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 4-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes4 value from the specified position in the bytes blob.
   */
  function slice4(bytes memory data, uint256 start) internal pure returns (bytes4) {
    bytes4 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 4-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 4-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return The extracted bytes4 value from the specified position in the bytes32 value.
   */
  function slice4(bytes32 data, uint256 start) internal pure returns (bytes4) {
    bytes2 output;
    assembly {
      output := shl(mul(8, start), data)
    }
    return output;
  }

  /**
   * @dev Extracts a 5-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 5-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes5 value from the specified position in the bytes blob.
   */
  function slice5(bytes memory data, uint256 start) internal pure returns (bytes5) {
    bytes5 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 5-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 5-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return The extracted bytes5 value from the specified position in the bytes32 value.
   */
  function slice5(bytes32 data, uint256 start) internal pure returns (bytes5) {
    bytes5 output;
    assembly {
      output := shl(mul(8, start), data)
    }
    return output;
  }

  /**
   * @dev Extracts a 6-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 6-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes6 value from the specified position in the bytes blob.
   */
  function slice6(bytes memory data, uint256 start) internal pure returns (bytes6) {
    bytes6 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 7-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 7-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes7 value from the specified position in the bytes blob.
   */
  function slice7(bytes memory data, uint256 start) internal pure returns (bytes7) {
    bytes7 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 8-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 8-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes8 value from the specified position in the bytes blob.
   */
  function slice8(bytes memory data, uint256 start) internal pure returns (bytes8) {
    bytes8 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 9-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 9-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes9 value from the specified position in the bytes blob.
   */
  function slice9(bytes memory data, uint256 start) internal pure returns (bytes9) {
    bytes9 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 10-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 10-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes10 value from the specified position in the bytes blob.
   */
  function slice10(bytes memory data, uint256 start) internal pure returns (bytes10) {
    bytes10 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 11-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 11-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes11 value from the specified position in the bytes blob.
   */
  function slice11(bytes memory data, uint256 start) internal pure returns (bytes11) {
    bytes11 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 12-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 12-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes12 value from the specified position in the bytes blob.
   */
  function slice12(bytes memory data, uint256 start) internal pure returns (bytes12) {
    bytes12 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 13-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 13-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes13 value from the specified position in the bytes blob.
   */
  function slice13(bytes memory data, uint256 start) internal pure returns (bytes13) {
    bytes13 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 14-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 14-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes14 value from the specified position in the bytes blob.
   */
  function slice14(bytes memory data, uint256 start) internal pure returns (bytes14) {
    bytes14 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 15-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 15-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes15 value from the specified position in the bytes blob.
   */
  function slice15(bytes memory data, uint256 start) internal pure returns (bytes15) {
    bytes15 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 16-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 16-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes16 value from the specified position in the bytes blob.
   */
  function slice16(bytes memory data, uint256 start) internal pure returns (bytes16) {
    bytes16 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 17-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 17-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes17 value from the specified position in the bytes blob.
   */
  function slice17(bytes memory data, uint256 start) internal pure returns (bytes17) {
    bytes17 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 18-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 18-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes18 value from the specified position in the bytes blob.
   */
  function slice18(bytes memory data, uint256 start) internal pure returns (bytes18) {
    bytes18 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 19-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 19-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes19 value from the specified position in the bytes blob.
   */
  function slice19(bytes memory data, uint256 start) internal pure returns (bytes19) {
    bytes19 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 20-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 20-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes20 value from the specified position in the bytes blob.
   */
  function slice20(bytes memory data, uint256 start) internal pure returns (bytes20) {
    bytes20 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 21-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 21-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes21 value from the specified position in the bytes blob.
   */
  function slice21(bytes memory data, uint256 start) internal pure returns (bytes21) {
    bytes21 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 22-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 22-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes22 value from the specified position in the bytes blob.
   */
  function slice22(bytes memory data, uint256 start) internal pure returns (bytes22) {
    bytes22 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 23-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 23-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes23 value from the specified position in the bytes blob.
   */
  function slice23(bytes memory data, uint256 start) internal pure returns (bytes23) {
    bytes23 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 24-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 24-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes24 value from the specified position in the bytes blob.
   */
  function slice24(bytes memory data, uint256 start) internal pure returns (bytes24) {
    bytes24 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 25-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 25-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes25 value from the specified position in the bytes blob.
   */
  function slice25(bytes memory data, uint256 start) internal pure returns (bytes25) {
    bytes25 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 26-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 26-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes26 value from the specified position in the bytes blob.
   */
  function slice26(bytes memory data, uint256 start) internal pure returns (bytes26) {
    bytes26 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 27-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 27-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes27 value from the specified position in the bytes blob.
   */
  function slice27(bytes memory data, uint256 start) internal pure returns (bytes27) {
    bytes27 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 28-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 28-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes28 value from the specified position in the bytes blob.
   */
  function slice28(bytes memory data, uint256 start) internal pure returns (bytes28) {
    bytes28 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 29-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 29-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes29 value from the specified position in the bytes blob.
   */
  function slice29(bytes memory data, uint256 start) internal pure returns (bytes29) {
    bytes29 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 30-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 30-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes30 value from the specified position in the bytes blob.
   */
  function slice30(bytes memory data, uint256 start) internal pure returns (bytes30) {
    bytes30 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 31-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 31-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes31 value from the specified position in the bytes blob.
   */
  function slice31(bytes memory data, uint256 start) internal pure returns (bytes31) {
    bytes31 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }

  /**
   * @dev Extracts a 32-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 32-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return The extracted bytes32 value from the specified position in the bytes blob.
   */
  function slice32(bytes memory data, uint256 start) internal pure returns (bytes32) {
    bytes32 output;
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
    return output;
  }
}
