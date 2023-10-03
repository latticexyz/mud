// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { WORD_SIZE, WORD_LAST_INDEX, BYTE_TO_BITS, MAX_TOTAL_FIELDS, MAX_DYNAMIC_FIELDS, LayoutOffsets } from "./constants.sol";

/**
 * @title FieldLayout
 * @dev Represents a field layout encoded into a single bytes32.
 * From left to right, the bytes are laid out as follows:
 * - 2 bytes for total length of all static fields
 * - 1 byte for number of static size fields
 * - 1 byte for number of dynamic size fields
 * - 28 bytes for 28 static field lengths
 * (MAX_DYNAMIC_FIELDS allows PackedCounter to pack the dynamic lengths into 1 word)
 */
type FieldLayout is bytes32;

// When importing FieldLayout, attach FieldLayoutInstance to it
using FieldLayoutInstance for FieldLayout global;

/**
 * @title FieldLayoutLib
 * @dev A library for handling field layout encoding into a single bytes32.
 * It provides a function to encode static and dynamic fields and ensure
 * various constraints regarding the length and size of the fields.
 */
library FieldLayoutLib {
  error FieldLayoutLib_InvalidLength(uint256 length);
  error FieldLayoutLib_StaticLengthIsZero();
  error FieldLayoutLib_StaticLengthDoesNotFitInAWord();

  /**
   * @notice Encodes the given field layout into a single bytes32.
   * @dev Ensures various constraints on the length and size of the fields.
   * Reverts if total fields, static field length, or static byte length exceed allowed limits.
   * @param _staticFields An array of static field lengths.
   * @param numDynamicFields The number of dynamic fields.
   * @return A FieldLayout structure containing the encoded field layout.
   */
  function encode(uint256[] memory _staticFields, uint256 numDynamicFields) internal pure returns (FieldLayout) {
    uint256 fieldLayout;
    uint256 totalLength;
    uint256 totalFields = _staticFields.length + numDynamicFields;
    if (totalFields > MAX_TOTAL_FIELDS) revert FieldLayoutLib_InvalidLength(totalFields);
    if (numDynamicFields > MAX_DYNAMIC_FIELDS) revert FieldLayoutLib_InvalidLength(numDynamicFields);

    // Compute the total static length and store the field lengths in the encoded fieldLayout
    for (uint256 i = 0; i < _staticFields.length; ) {
      uint256 staticByteLength = _staticFields[i];
      if (staticByteLength == 0) {
        revert FieldLayoutLib_StaticLengthIsZero();
      } else if (staticByteLength > WORD_SIZE) {
        revert FieldLayoutLib_StaticLengthDoesNotFitInAWord();
      }

      unchecked {
        // (safe because 28 (max _staticFields.length) * 32 (max static length) < 2**16)
        totalLength += staticByteLength;
        // Sequentially store lengths after the first 4 bytes (which are reserved for total length and field numbers)
        // (safe because of the initial _staticFields.length check)
        fieldLayout |= uint256(_staticFields[i]) << ((WORD_LAST_INDEX - 4 - i) * BYTE_TO_BITS);
        i++;
      }
    }

    // Store total static length in the first 2 bytes,
    // number of static fields in the 3rd byte,
    // number of dynamic fields in the 4th byte
    // (optimizer can handle this, no need for unchecked or single-line assignment)
    fieldLayout |= totalLength << LayoutOffsets.TOTAL_LENGTH;
    fieldLayout |= _staticFields.length << LayoutOffsets.NUM_STATIC_FIELDS;
    fieldLayout |= numDynamicFields << LayoutOffsets.NUM_DYNAMIC_FIELDS;

    return FieldLayout.wrap(bytes32(fieldLayout));
  }
}

/**
 * @title FieldLayoutInstance
 * @dev Provides instance functions for obtaining information from an encoded FieldLayout.
 */
library FieldLayoutInstance {
  /**
   * @notice Get the static byte length at the given index from the field layout.
   * @param fieldLayout The FieldLayout to extract the byte length from.
   * @param index The field index to get the static byte length from.
   * @return The static byte length at the specified index.
   */
  function atIndex(FieldLayout fieldLayout, uint256 index) internal pure returns (uint256) {
    unchecked {
      return uint8(uint256(fieldLayout.unwrap()) >> ((WORD_LAST_INDEX - 4 - index) * BYTE_TO_BITS));
    }
  }

  /**
   * @notice Get the total static byte length for the given field layout.
   * @param fieldLayout The FieldLayout to extract the total static byte length from.
   * @return The total static byte length.
   */
  function staticDataLength(FieldLayout fieldLayout) internal pure returns (uint256) {
    return uint256(FieldLayout.unwrap(fieldLayout)) >> LayoutOffsets.TOTAL_LENGTH;
  }

  /**
   * @notice Get the number of static fields for the field layout.
   * @param fieldLayout The FieldLayout to extract the number of static fields from.
   * @return The number of static fields.
   */
  function numStaticFields(FieldLayout fieldLayout) internal pure returns (uint256) {
    return uint8(uint256(fieldLayout.unwrap()) >> LayoutOffsets.NUM_STATIC_FIELDS);
  }

  /**
   * @notice Get the number of dynamic length fields for the field layout.
   * @param fieldLayout The FieldLayout to extract the number of dynamic fields from.
   * @return The number of dynamic length fields.
   */
  function numDynamicFields(FieldLayout fieldLayout) internal pure returns (uint256) {
    return uint8(uint256(fieldLayout.unwrap()) >> LayoutOffsets.NUM_DYNAMIC_FIELDS);
  }

  /**
   * @notice Get the total number of fields for the field layout.
   * @param fieldLayout The FieldLayout to extract the total number of fields from.
   * @return The total number of fields.
   */
  function numFields(FieldLayout fieldLayout) internal pure returns (uint256) {
    unchecked {
      return
        uint8(uint256(fieldLayout.unwrap()) >> LayoutOffsets.NUM_STATIC_FIELDS) +
        uint8(uint256(fieldLayout.unwrap()) >> LayoutOffsets.NUM_DYNAMIC_FIELDS);
    }
  }

  /**
   * @notice Check if the field layout is empty.
   * @param fieldLayout The FieldLayout to check.
   * @return True if the field layout is empty, false otherwise.
   */
  function isEmpty(FieldLayout fieldLayout) internal pure returns (bool) {
    return FieldLayout.unwrap(fieldLayout) == bytes32(0);
  }

  /**
   * @notice Validate the field layout with various checks on the length and size of the fields.
   * @dev Reverts if total fields, static field length, or static byte length exceed allowed limits.
   * @param fieldLayout The FieldLayout to validate.
   * @param allowEmpty A flag to determine if empty field layouts are allowed.
   */
  function validate(FieldLayout fieldLayout, bool allowEmpty) internal pure {
    // FieldLayout must not be empty
    if (!allowEmpty && fieldLayout.isEmpty()) revert FieldLayoutLib.FieldLayoutLib_InvalidLength(0);

    // FieldLayout must have no more than MAX_DYNAMIC_FIELDS
    uint256 _numDynamicFields = fieldLayout.numDynamicFields();
    if (_numDynamicFields > MAX_DYNAMIC_FIELDS) revert FieldLayoutLib.FieldLayoutLib_InvalidLength(_numDynamicFields);

    uint256 _numStaticFields = fieldLayout.numStaticFields();
    // FieldLayout must not have more than MAX_TOTAL_FIELDS in total
    uint256 _numTotalFields = _numStaticFields + _numDynamicFields;
    if (_numTotalFields > MAX_TOTAL_FIELDS) revert FieldLayoutLib.FieldLayoutLib_InvalidLength(_numTotalFields);

    // Static lengths must be valid
    for (uint256 i; i < _numStaticFields; ) {
      uint256 staticByteLength = fieldLayout.atIndex(i);
      if (staticByteLength == 0) {
        revert FieldLayoutLib.FieldLayoutLib_StaticLengthIsZero();
      } else if (staticByteLength > WORD_SIZE) {
        revert FieldLayoutLib.FieldLayoutLib_StaticLengthDoesNotFitInAWord();
      }
      unchecked {
        i++;
      }
    }
  }

  /**
   * @notice Unwrap the field layout to obtain the raw bytes32 representation.
   * @param fieldLayout The FieldLayout to unwrap.
   * @return The unwrapped bytes32 representation of the FieldLayout.
   */
  function unwrap(FieldLayout fieldLayout) internal pure returns (bytes32) {
    return FieldLayout.unwrap(fieldLayout);
  }
}
