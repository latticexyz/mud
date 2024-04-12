// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title Bytes
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
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
   *    GET
   *
   *    Used by codegen libraries
   *
   ************************************************************************/

  /**
   * @dev Extracts a single byte from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a byte is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes1 value from the specified position in the bytes blob.
   */
  function getBytes1(bytes memory data, uint256 start) internal pure returns (bytes1 output) {
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
  function getBytes1(bytes32 data, uint256 start) internal pure returns (bytes1 output) {
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
  function getBytes2(bytes memory data, uint256 start) internal pure returns (bytes2 output) {
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
  function getBytes2(bytes32 data, uint256 start) internal pure returns (bytes2 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 3-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 3-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes3 value from the specified position in the bytes blob.
   */
  function getBytes3(bytes memory data, uint256 start) internal pure returns (bytes3 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 3-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 3-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes3 value from the specified position in the bytes32 value.
   */
  function getBytes3(bytes32 data, uint256 start) internal pure returns (bytes3 output) {
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
  function getBytes4(bytes memory data, uint256 start) internal pure returns (bytes4 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 4-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 4-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes4 value from the specified position in the bytes32 value.
   */
  function getBytes4(bytes32 data, uint256 start) internal pure returns (bytes4 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 5-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 5-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes5 value from the specified position in the bytes blob.
   */
  function getBytes5(bytes memory data, uint256 start) internal pure returns (bytes5 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 5-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 5-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes5 value from the specified position in the bytes32 value.
   */
  function getBytes5(bytes32 data, uint256 start) internal pure returns (bytes5 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 6-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 6-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes6 value from the specified position in the bytes blob.
   */
  function getBytes6(bytes memory data, uint256 start) internal pure returns (bytes6 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 6-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 6-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes6 value from the specified position in the bytes32 value.
   */
  function getBytes6(bytes32 data, uint256 start) internal pure returns (bytes6 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 7-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 7-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes7 value from the specified position in the bytes blob.
   */
  function getBytes7(bytes memory data, uint256 start) internal pure returns (bytes7 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 7-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 7-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes7 value from the specified position in the bytes32 value.
   */
  function getBytes7(bytes32 data, uint256 start) internal pure returns (bytes7 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 8-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 8-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes8 value from the specified position in the bytes blob.
   */
  function getBytes8(bytes memory data, uint256 start) internal pure returns (bytes8 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 8-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 8-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes8 value from the specified position in the bytes32 value.
   */
  function getBytes8(bytes32 data, uint256 start) internal pure returns (bytes8 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 9-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 9-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes9 value from the specified position in the bytes blob.
   */
  function getBytes9(bytes memory data, uint256 start) internal pure returns (bytes9 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 9-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 9-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes9 value from the specified position in the bytes32 value.
   */
  function getBytes9(bytes32 data, uint256 start) internal pure returns (bytes9 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 10-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 10-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes10 value from the specified position in the bytes blob.
   */
  function getBytes10(bytes memory data, uint256 start) internal pure returns (bytes10 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 10-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 10-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes10 value from the specified position in the bytes32 value.
   */
  function getBytes10(bytes32 data, uint256 start) internal pure returns (bytes10 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 11-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 11-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes11 value from the specified position in the bytes blob.
   */
  function getBytes11(bytes memory data, uint256 start) internal pure returns (bytes11 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 11-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 11-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes11 value from the specified position in the bytes32 value.
   */
  function getBytes11(bytes32 data, uint256 start) internal pure returns (bytes11 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 12-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 12-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes12 value from the specified position in the bytes blob.
   */
  function getBytes12(bytes memory data, uint256 start) internal pure returns (bytes12 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 12-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 12-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes12 value from the specified position in the bytes32 value.
   */
  function getBytes12(bytes32 data, uint256 start) internal pure returns (bytes12 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 13-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 13-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes13 value from the specified position in the bytes blob.
   */
  function getBytes13(bytes memory data, uint256 start) internal pure returns (bytes13 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 13-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 13-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes13 value from the specified position in the bytes32 value.
   */
  function getBytes13(bytes32 data, uint256 start) internal pure returns (bytes13 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 14-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 14-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes14 value from the specified position in the bytes blob.
   */
  function getBytes14(bytes memory data, uint256 start) internal pure returns (bytes14 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 14-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 14-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes14 value from the specified position in the bytes32 value.
   */
  function getBytes14(bytes32 data, uint256 start) internal pure returns (bytes14 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 15-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 15-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes15 value from the specified position in the bytes blob.
   */
  function getBytes15(bytes memory data, uint256 start) internal pure returns (bytes15 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 15-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 15-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes15 value from the specified position in the bytes32 value.
   */
  function getBytes15(bytes32 data, uint256 start) internal pure returns (bytes15 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 16-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 16-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes16 value from the specified position in the bytes blob.
   */
  function getBytes16(bytes memory data, uint256 start) internal pure returns (bytes16 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 16-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 16-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes16 value from the specified position in the bytes32 value.
   */
  function getBytes16(bytes32 data, uint256 start) internal pure returns (bytes16 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 17-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 17-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes17 value from the specified position in the bytes blob.
   */
  function getBytes17(bytes memory data, uint256 start) internal pure returns (bytes17 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 17-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 17-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes17 value from the specified position in the bytes32 value.
   */
  function getBytes17(bytes32 data, uint256 start) internal pure returns (bytes17 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 18-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 18-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes18 value from the specified position in the bytes blob.
   */
  function getBytes18(bytes memory data, uint256 start) internal pure returns (bytes18 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 18-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 18-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes18 value from the specified position in the bytes32 value.
   */
  function getBytes18(bytes32 data, uint256 start) internal pure returns (bytes18 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 19-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 19-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes19 value from the specified position in the bytes blob.
   */
  function getBytes19(bytes memory data, uint256 start) internal pure returns (bytes19 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 19-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 19-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes19 value from the specified position in the bytes32 value.
   */
  function getBytes19(bytes32 data, uint256 start) internal pure returns (bytes19 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 20-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 20-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes20 value from the specified position in the bytes blob.
   */
  function getBytes20(bytes memory data, uint256 start) internal pure returns (bytes20 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 20-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 20-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes20 value from the specified position in the bytes32 value.
   */
  function getBytes20(bytes32 data, uint256 start) internal pure returns (bytes20 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 21-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 21-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes21 value from the specified position in the bytes blob.
   */
  function getBytes21(bytes memory data, uint256 start) internal pure returns (bytes21 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 21-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 21-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes21 value from the specified position in the bytes32 value.
   */
  function getBytes21(bytes32 data, uint256 start) internal pure returns (bytes21 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 22-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 22-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes22 value from the specified position in the bytes blob.
   */
  function getBytes22(bytes memory data, uint256 start) internal pure returns (bytes22 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 22-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 22-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes22 value from the specified position in the bytes32 value.
   */
  function getBytes22(bytes32 data, uint256 start) internal pure returns (bytes22 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 23-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 23-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes23 value from the specified position in the bytes blob.
   */
  function getBytes23(bytes memory data, uint256 start) internal pure returns (bytes23 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 23-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 23-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes23 value from the specified position in the bytes32 value.
   */
  function getBytes23(bytes32 data, uint256 start) internal pure returns (bytes23 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 24-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 24-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes24 value from the specified position in the bytes blob.
   */
  function getBytes24(bytes memory data, uint256 start) internal pure returns (bytes24 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 24-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 24-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes24 value from the specified position in the bytes32 value.
   */
  function getBytes24(bytes32 data, uint256 start) internal pure returns (bytes24 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 25-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 25-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes25 value from the specified position in the bytes blob.
   */
  function getBytes25(bytes memory data, uint256 start) internal pure returns (bytes25 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 25-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 25-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes25 value from the specified position in the bytes32 value.
   */
  function getBytes25(bytes32 data, uint256 start) internal pure returns (bytes25 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 26-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 26-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes26 value from the specified position in the bytes blob.
   */
  function getBytes26(bytes memory data, uint256 start) internal pure returns (bytes26 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 26-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 26-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes26 value from the specified position in the bytes32 value.
   */
  function getBytes26(bytes32 data, uint256 start) internal pure returns (bytes26 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 27-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 27-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes27 value from the specified position in the bytes blob.
   */
  function getBytes27(bytes memory data, uint256 start) internal pure returns (bytes27 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 27-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 27-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes27 value from the specified position in the bytes32 value.
   */
  function getBytes27(bytes32 data, uint256 start) internal pure returns (bytes27 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 28-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 28-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes28 value from the specified position in the bytes blob.
   */
  function getBytes28(bytes memory data, uint256 start) internal pure returns (bytes28 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 28-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 28-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes28 value from the specified position in the bytes32 value.
   */
  function getBytes28(bytes32 data, uint256 start) internal pure returns (bytes28 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 29-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 29-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes29 value from the specified position in the bytes blob.
   */
  function getBytes29(bytes memory data, uint256 start) internal pure returns (bytes29 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 29-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 29-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes29 value from the specified position in the bytes32 value.
   */
  function getBytes29(bytes32 data, uint256 start) internal pure returns (bytes29 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 30-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 30-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes30 value from the specified position in the bytes blob.
   */
  function getBytes30(bytes memory data, uint256 start) internal pure returns (bytes30 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 30-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 30-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes30 value from the specified position in the bytes32 value.
   */
  function getBytes30(bytes32 data, uint256 start) internal pure returns (bytes30 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 31-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 31-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes31 value from the specified position in the bytes blob.
   */
  function getBytes31(bytes memory data, uint256 start) internal pure returns (bytes31 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 31-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 31-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes31 value from the specified position in the bytes32 value.
   */
  function getBytes31(bytes32 data, uint256 start) internal pure returns (bytes31 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }

  /**
   * @dev Extracts a 32-byte sequence from a bytes blob starting at a specific position.
   * @param data The bytes blob from which a 32-byte sequence is to be extracted.
   * @param start The starting position within the bytes blob for extraction.
   * @return output The extracted bytes32 value from the specified position in the bytes blob.
   */
  function getBytes32(bytes memory data, uint256 start) internal pure returns (bytes32 output) {
    assembly {
      output := mload(add(add(data, 0x20), start))
    }
  }

  /**
   * @dev Extracts a 32-byte sequence from a bytes32 value starting at a specific position.
   * @param data The bytes32 value from which a 32-byte sequence is to be extracted.
   * @param start The starting position within the bytes32 value for extraction.
   * @return output The extracted bytes32 value from the specified position in the bytes32 value.
   */
  function getBytes32(bytes32 data, uint256 start) internal pure returns (bytes32 output) {
    assembly {
      output := shl(mul(8, start), data)
    }
  }
}
