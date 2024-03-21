// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { BYTE_TO_BITS } from "./constants.sol";
import { IEncodedLengthsErrors } from "./IEncodedLengthsErrors.sol";

/**
 * @title EncodedLengths Type Definition
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Describes how the encoded lengths is structured.
 * - 0x00-0x06 The least significant 7 bytes (uint56) represent the total byte length of dynamic (variable length) data.
 * - 0x07-0xB The next five bytes (uint40) represent the length of the first dynamic field.
 * - 0x0C-0x10 Followed by the length of the second dynamic field
 * - 0x11-0x15 Length of the third dynamic field
 * - 0x16-0x1A Length of fourth dynamic field
 * - 0x1B-0x1F Length of fifth dynamic field
 */
type EncodedLengths is bytes32;

using EncodedLengthsInstance for EncodedLengths global;

// Constants for encoded lengths handling:

// Number of bits for the 7-byte accumulator
uint256 constant ACC_BITS = 7 * BYTE_TO_BITS;
// Number of bits for the 5-byte sections
uint256 constant VAL_BITS = 5 * BYTE_TO_BITS;
// Maximum value of a 5-byte section
uint256 constant MAX_VAL = type(uint40).max;

/**
 * @title EncodedLengths Library
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice Static functions for handling EncodedLengths type.
 * @dev Provides utility functions to pack values into EncodedLengths.
 * The caller must ensure that the value arguments are <= MAX_VAL.
 */
library EncodedLengthsLib {
  /**
   * @notice Packs a single value into EncodedLengths.
   * @dev Encodes the given value 'a' into the structure of EncodedLengths. The encoded lengths's accumulator
   * will be set to 'a', and the first value slot of the EncodedLengths will also be set to 'a'.
   * @param a The length of the first dynamic field's data.
   * @return The resulting EncodedLengths containing the encoded value.
   */
  function pack(uint256 a) internal pure returns (EncodedLengths) {
    uint256 encodedLengths;
    unchecked {
      encodedLengths = a;
      encodedLengths |= (uint256(a) << (ACC_BITS + VAL_BITS * 0));
    }
    return EncodedLengths.wrap(bytes32(encodedLengths));
  }

  /**
   * @notice Packs two values into EncodedLengths.
   * @dev Encodes the given values 'a'-'b' into the structure of EncodedLengths.
   * @param a The length of the first dynamic field's data.
   * @param b The length of the second dynamic field's data.
   * @return The resulting EncodedLengths containing the encoded values.
   */
  function pack(uint256 a, uint256 b) internal pure returns (EncodedLengths) {
    uint256 encodedLengths;
    unchecked {
      encodedLengths = a + b;
      encodedLengths |= (uint256(a) << (ACC_BITS + VAL_BITS * 0));
      encodedLengths |= (uint256(b) << (ACC_BITS + VAL_BITS * 1));
    }
    return EncodedLengths.wrap(bytes32(encodedLengths));
  }

  /**
   * @notice Packs three values into EncodedLengths.
   * @dev Encodes the given values 'a'-'c' into the structure of EncodedLengths.
   * @param a The length of the first dynamic field's data.
   * @param b The length of the second dynamic field's data.
   * @param c The length of the third dynamic field's data.
   * @return The resulting EncodedLengths containing the encoded values.
   */
  function pack(uint256 a, uint256 b, uint256 c) internal pure returns (EncodedLengths) {
    uint256 encodedLengths;
    unchecked {
      encodedLengths = a + b + c;
      encodedLengths |= (uint256(a) << (ACC_BITS + VAL_BITS * 0));
      encodedLengths |= (uint256(b) << (ACC_BITS + VAL_BITS * 1));
      encodedLengths |= (uint256(c) << (ACC_BITS + VAL_BITS * 2));
    }
    return EncodedLengths.wrap(bytes32(encodedLengths));
  }

  /**
   * @notice Packs four values into EncodedLengths.
   * @dev Encodes the given values 'a'-'d' into the structure of EncodedLengths.
   * @param a The length of the first dynamic field's data.
   * @param b The length of the second dynamic field's data.
   * @param c The length of the third dynamic field's data.
   * @param d The length of the fourth dynamic field's data.
   * @return The resulting EncodedLengths containing the encoded values.
   */
  function pack(uint256 a, uint256 b, uint256 c, uint256 d) internal pure returns (EncodedLengths) {
    uint256 encodedLengths;
    unchecked {
      encodedLengths = a + b + c + d;
      encodedLengths |= (uint256(a) << (ACC_BITS + VAL_BITS * 0));
      encodedLengths |= (uint256(b) << (ACC_BITS + VAL_BITS * 1));
      encodedLengths |= (uint256(c) << (ACC_BITS + VAL_BITS * 2));
      encodedLengths |= (uint256(d) << (ACC_BITS + VAL_BITS * 3));
    }
    return EncodedLengths.wrap(bytes32(encodedLengths));
  }

  /**
   * @notice Packs five values into EncodedLengths.
   * @dev Encodes the given values 'a'-'e' into the structure of EncodedLengths.
   * @param a The length of the first dynamic field's data.
   * @param b The length of the second dynamic field's data.
   * @param c The length of the third dynamic field's data.
   * @param d The length of the fourth dynamic field's data.
   * @param e The length of the fifth dynamic field's data.
   * @return The resulting EncodedLengths containing the encoded values.
   */
  function pack(uint256 a, uint256 b, uint256 c, uint256 d, uint256 e) internal pure returns (EncodedLengths) {
    uint256 encodedLengths;
    unchecked {
      encodedLengths = a + b + c + d + e;
      encodedLengths |= (uint256(a) << (ACC_BITS + VAL_BITS * 0));
      encodedLengths |= (uint256(b) << (ACC_BITS + VAL_BITS * 1));
      encodedLengths |= (uint256(c) << (ACC_BITS + VAL_BITS * 2));
      encodedLengths |= (uint256(d) << (ACC_BITS + VAL_BITS * 3));
      encodedLengths |= (uint256(e) << (ACC_BITS + VAL_BITS * 4));
    }
    return EncodedLengths.wrap(bytes32(encodedLengths));
  }
}

/**
 * @title EncodedLengths Instance Library
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice Instance functions for handling EncodedLengths.
 * @dev Offers decoding, extracting, and setting functionalities for EncodedLengths.
 */
library EncodedLengthsInstance {
  /**
   * @notice Decode the accumulated counter from EncodedLengths.
   * @dev Extracts the right-most 7 bytes of EncodedLengths.
   * @param encodedLengths The encoded lengths to decode.
   * @return The accumulated value from the EncodedLengths.
   */
  function total(EncodedLengths encodedLengths) internal pure returns (uint256) {
    return uint56(uint256(EncodedLengths.unwrap(encodedLengths)));
  }

  /**
   * @notice Decode the dynamic field size at a specific index from EncodedLengths.
   * @dev Extracts value right-to-left, with 5 bytes per dynamic field after the right-most 7 bytes.
   * @param encodedLengths The encoded lengths to decode.
   * @param index The index to retrieve.
   * @return The value at the given index from the EncodedLengths.
   */
  function atIndex(EncodedLengths encodedLengths, uint8 index) internal pure returns (uint256) {
    unchecked {
      return uint40(uint256(EncodedLengths.unwrap(encodedLengths) >> (ACC_BITS + VAL_BITS * index)));
    }
  }

  /**
   * @notice Set a counter at a specific index in EncodedLengths.
   * @dev Updates a value at a specific index and updates the accumulator field.
   * @param encodedLengths The encoded lengths to modify.
   * @param index The index to set.
   * @param newValueAtIndex The new value to set at the given index.
   * @return The modified EncodedLengths.
   */
  function setAtIndex(
    EncodedLengths encodedLengths,
    uint8 index,
    uint256 newValueAtIndex
  ) internal pure returns (EncodedLengths) {
    if (newValueAtIndex > MAX_VAL) {
      revert IEncodedLengthsErrors.EncodedLengths_InvalidLength(newValueAtIndex);
    }

    uint256 rawEncodedLengths = uint256(EncodedLengths.unwrap(encodedLengths));

    // Get current lengths (total and at index)
    uint256 accumulator = total(encodedLengths);
    uint256 currentValueAtIndex = atIndex(encodedLengths, index);

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
    rawEncodedLengths = (rawEncodedLengths & ~uint256(type(uint56).max)) | accumulator;

    // Zero out the value slot at the given index, then set the new value
    rawEncodedLengths = (rawEncodedLengths & ~mask) | ((newValueAtIndex << offset) & mask);

    return EncodedLengths.wrap(bytes32(rawEncodedLengths));
  }

  /**
   * @notice Unwrap EncodedLengths to its raw bytes32 representation.
   * @param encodedLengths The encoded lengths to unwrap.
   * @return The raw bytes32 value of the EncodedLengths.
   */
  function unwrap(EncodedLengths encodedLengths) internal pure returns (bytes32) {
    return EncodedLengths.unwrap(encodedLengths);
  }
}
