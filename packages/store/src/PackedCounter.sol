// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/**
 * @title PackedCounter Type Definition
 * @dev Describes how the packed counter is structured.
 * - 0x00-0x06 The least significant 7 bytes (uint56) represent the total byte length of dynamic (variable length) data.
 * - 0x07-0xB The next five bytes (uint40) represent the length of the first dynamic field.
 * - 0x0C-0x10 Followed by the length of the second dynamic field
 * - 0x11-0x15 Length of the third dynamic field
 * - 0x16-0x1A Length of fourth dynamic field
 * - 0x1B-0x1F Length of fifth dynamic field
 */
type PackedCounter is bytes32;

using PackedCounterInstance for PackedCounter global;

// Constants for packed counter handling:

// Number of bits for the 7-byte accumulator
uint256 constant ACC_BITS = 7 * 8;
// Number of bits for the 5-byte sections
uint256 constant VAL_BITS = 5 * 8;
// Maximum value of a 5-byte section
uint256 constant MAX_VAL = type(uint40).max;

/**
 * @title PackedCounter Library
 * @notice Static functions for handling PackedCounter type.
 * @dev Provides utility functions to pack values into a PackedCounter.
 * The caller must ensure that the value arguments are <= MAX_VAL.
 */
library PackedCounterLib {
  /**
   * @notice Packs a single value into a PackedCounter.
   * @dev Encodes the given value 'a' into the structure of a PackedCounter. The packed counter's accumulator
   * will be set to 'a', and the first value slot of the PackedCounter will also be set to 'a'.
   * @param a The length of the first dynamic field's data.
   * @return The resulting PackedCounter containing the encoded value.
   */
  function pack(uint256 a) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    unchecked {
      packedCounter = a;
      packedCounter |= (uint256(a) << (ACC_BITS + VAL_BITS * 0));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }

  /**
   * @notice Packs a single value into a PackedCounter.
   * @dev Encodes the given values 'a'-'b' into the structure of a PackedCounter.
   * @param a The length of the first dynamic field's data.
   * @param b The length of the second dynamic field's data.
   * @return The resulting PackedCounter containing the encoded values.
   */
  function pack(uint256 a, uint256 b) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    unchecked {
      packedCounter = a + b;
      packedCounter |= (uint256(a) << (ACC_BITS + VAL_BITS * 0));
      packedCounter |= (uint256(b) << (ACC_BITS + VAL_BITS * 1));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }

  /**
   * @notice Packs a single value into a PackedCounter.
   * @dev Encodes the given values 'a'-'c' into the structure of a PackedCounter.
   * @param a The length of the first dynamic field's data.
   * @param b The length of the second dynamic field's data.
   * @param c The length of the third dynamic field's data.
   * @return The resulting PackedCounter containing the encoded values.
   */
  function pack(uint256 a, uint256 b, uint256 c) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    unchecked {
      packedCounter = a + b + c;
      packedCounter |= (uint256(a) << (ACC_BITS + VAL_BITS * 0));
      packedCounter |= (uint256(b) << (ACC_BITS + VAL_BITS * 1));
      packedCounter |= (uint256(c) << (ACC_BITS + VAL_BITS * 2));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }

  /**
   * @notice Packs a single value into a PackedCounter.
   * @dev Encodes the given values 'a'-'d' into the structure of a PackedCounter.
   * @param a The length of the first dynamic field's data.
   * @param b The length of the second dynamic field's data.
   * @param c The length of the third dynamic field's data.
   * @param d The length of the fourth dynamic field's data.
   * @return The resulting PackedCounter containing the encoded values.
   */
  function pack(uint256 a, uint256 b, uint256 c, uint256 d) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    unchecked {
      packedCounter = a + b + c + d;
      packedCounter |= (uint256(a) << (ACC_BITS + VAL_BITS * 0));
      packedCounter |= (uint256(b) << (ACC_BITS + VAL_BITS * 1));
      packedCounter |= (uint256(c) << (ACC_BITS + VAL_BITS * 2));
      packedCounter |= (uint256(d) << (ACC_BITS + VAL_BITS * 3));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }

  /**
   * @notice Packs a single value into a PackedCounter.
   * @dev Encodes the given values 'a'-'e' into the structure of a PackedCounter.
   * @param a The length of the first dynamic field's data.
   * @param b The length of the second dynamic field's data.
   * @param c The length of the third dynamic field's data.
   * @param d The length of the fourth dynamic field's data.
   * @param e The length of the fourth dynamic field's data.
   * @return The resulting PackedCounter containing the encoded values.
   */
  function pack(uint256 a, uint256 b, uint256 c, uint256 d, uint256 e) internal pure returns (PackedCounter) {
    uint256 packedCounter;
    unchecked {
      packedCounter = a + b + c + d + e;
      packedCounter |= (uint256(a) << (ACC_BITS + VAL_BITS * 0));
      packedCounter |= (uint256(b) << (ACC_BITS + VAL_BITS * 1));
      packedCounter |= (uint256(c) << (ACC_BITS + VAL_BITS * 2));
      packedCounter |= (uint256(d) << (ACC_BITS + VAL_BITS * 3));
      packedCounter |= (uint256(e) << (ACC_BITS + VAL_BITS * 4));
    }
    return PackedCounter.wrap(bytes32(packedCounter));
  }
}

/**
 * @title PackedCounter Instance Library
 * @notice Instance functions for handling a PackedCounter.
 * @dev Offers decoding, extracting, and setting functionalities for a PackedCounter.
 */
library PackedCounterInstance {
  error PackedCounter_InvalidLength(uint256 length);

  /**
   * @notice Decode the accumulated counter from a PackedCounter.
   * @dev Extracts the right-most 7 bytes of a PackedCounter.
   * @param packedCounter The packed counter to decode.
   * @return The accumulated value from the PackedCounter.
   */
  function total(PackedCounter packedCounter) internal pure returns (uint256) {
    return uint56(uint256(PackedCounter.unwrap(packedCounter)));
  }

  /**
   * @notice Decode the dynamic field size at a specific index from a PackedCounter.
   * @dev Extracts value right-to-left, with 5 bytes per dynamic field after the right-most 7 bytes.
   * @param packedCounter The packed counter to decode.
   * @param index The index to retrieve.
   * @return The value at the given index from the PackedCounter.
   */
  function atIndex(PackedCounter packedCounter, uint8 index) internal pure returns (uint256) {
    unchecked {
      return uint40(uint256(PackedCounter.unwrap(packedCounter) >> (ACC_BITS + VAL_BITS * index)));
    }
  }

  /**
   * @notice Set a counter at a specific index in a PackedCounter.
   * @dev Updates a value at a specific index and updates the accumulator field.
   * @param packedCounter The packed counter to modify.
   * @param index The index to set.
   * @param newValueAtIndex The new value to set at the given index.
   * @return The modified PackedCounter.
   */
  function setAtIndex(
    PackedCounter packedCounter,
    uint8 index,
    uint256 newValueAtIndex
  ) internal pure returns (PackedCounter) {
    if (newValueAtIndex > MAX_VAL) {
      revert PackedCounter_InvalidLength(newValueAtIndex);
    }

    uint256 rawPackedCounter = uint256(PackedCounter.unwrap(packedCounter));

    // Get current lengths (total and at index)
    uint256 accumulator = total(packedCounter);
    uint256 currentValueAtIndex = atIndex(packedCounter, index);

    // Compute the difference and update the total value
    unchecked {
      if (newValueAtIndex >= currentValueAtIndex) {
        accumulator += newValueAtIndex - currentValueAtIndex;
      } else {
        accumulator -= currentValueAtIndex - newValueAtIndex;
      }
    }

    // Set the new accumulated value and value at index
    // (7 bytes total length, 5 bytes per dynamic field)
    uint256 offset;
    unchecked {
      offset = ACC_BITS + VAL_BITS * index;
    }
    // Bitmask with 1s at the 5 bytes that form the value slot at the given index
    uint256 mask = uint256(type(uint40).max) << offset;

    // First set the last 7 bytes to 0, then set them to the new length
    rawPackedCounter = (rawPackedCounter & ~uint256(type(uint56).max)) | accumulator;

    // Zero out the value slot at the given index, then set the new value
    rawPackedCounter = (rawPackedCounter & ~mask) | ((newValueAtIndex << offset) & mask);

    return PackedCounter.wrap(bytes32(rawPackedCounter));
  }

  /**
   * @notice Unwrap a PackedCounter to its raw bytes32 representation.
   * @param packedCounter The packed counter to unwrap.
   * @return The raw bytes32 value of the PackedCounter.
   */
  function unwrap(PackedCounter packedCounter) internal pure returns (bytes32) {
    return PackedCounter.unwrap(packedCounter);
  }
}
