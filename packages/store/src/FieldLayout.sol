// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { WORD_SIZE, WORD_LAST_INDEX, BYTE_TO_BITS, MAX_TOTAL_FIELDS, MAX_DYNAMIC_FIELDS, LayoutOffsets } from "./constants.sol";
import { IFieldLayoutErrors } from "./IFieldLayoutErrors.sol";

/**
 * @title FieldLayout
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Represents a field layout encoded into a single bytes32.
 * From left to right, the bytes are laid out as follows:
 * - 2 bytes for total length of all static fields
 * - 1 byte for number of static size fields
 * - 1 byte for number of dynamic size fields
 * - 28 bytes for 28 static field lengths
 * (MAX_DYNAMIC_FIELDS allows EncodedLengths to pack the dynamic lengths into 1 word)
 */
type FieldLayout is bytes32;

// When importing FieldLayout, attach FieldLayoutInstance to it
using FieldLayoutInstance for FieldLayout global;

/**
 * @title FieldLayoutLib
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev A library for handling field layout encoding into a single bytes32.
 * It provides a function to encode static and dynamic fields and ensure
 * various constraints regarding the length and size of the fields.
 */
library FieldLayoutLib {
  /**
   * @notice Encodes the given field layout into a single bytes32.
   * @dev Ensures various constraints on the length and size of the fields.
   * Reverts if total fields, static field length, or static byte length exceed allowed limits.
   * @param _staticFieldLengths An array of static field lengths.
   * @param numDynamicFields The number of dynamic fields.
   * @return A FieldLayout structure containing the encoded field layout.
   */
  function encode(uint256[] memory _staticFieldLengths, uint256 numDynamicFields) internal pure returns (FieldLayout) {
    uint256 fieldLayout;
    uint256 totalLength;
    uint256 totalFields = _staticFieldLengths.length + numDynamicFields;
    if (totalFields > MAX_TOTAL_FIELDS)
      revert IFieldLayoutErrors.FieldLayout_TooManyFields(totalFields, MAX_TOTAL_FIELDS);
    if (numDynamicFields > MAX_DYNAMIC_FIELDS)
      revert IFieldLayoutErrors.FieldLayout_TooManyDynamicFields(numDynamicFields, MAX_DYNAMIC_FIELDS);

    // Compute the total static length and store the field lengths in the encoded fieldLayout
    for (uint256 i; i < _staticFieldLengths.length; ) {
      uint256 staticByteLength = _staticFieldLengths[i];
      if (staticByteLength == 0) {
        revert IFieldLayoutErrors.FieldLayout_StaticLengthIsZero(i);
      } else if (staticByteLength > WORD_SIZE) {
        revert IFieldLayoutErrors.FieldLayout_StaticLengthDoesNotFitInAWord(i);
      }

      unchecked {
        // (safe because 28 (max _staticFieldLengths.length) * 32 (max static length) < 2**16)
        totalLength += staticByteLength;
        // Sequentially store lengths after the first 4 bytes (which are reserved for total length and field numbers)
        // (safe because of the initial _staticFieldLengths.length check)
        fieldLayout |= uint256(_staticFieldLengths[i]) << ((WORD_LAST_INDEX - 4 - i) * BYTE_TO_BITS);
        i++;
      }
    }

    // Store total static length in the first 2 bytes,
    // number of static fields in the 3rd byte,
    // number of dynamic fields in the 4th byte
    // (optimizer can handle this, no need for unchecked or single-line assignment)
    fieldLayout |= totalLength << LayoutOffsets.TOTAL_LENGTH;
    fieldLayout |= _staticFieldLengths.length << LayoutOffsets.NUM_STATIC_FIELDS;
    fieldLayout |= numDynamicFields << LayoutOffsets.NUM_DYNAMIC_FIELDS;

    return FieldLayout.wrap(bytes32(fieldLayout));
  }
}

/**
 * @title FieldLayoutInstance
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
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
   */
  function validate(FieldLayout fieldLayout) internal pure {
    if (fieldLayout.isEmpty()) {
      revert IFieldLayoutErrors.FieldLayout_Empty();
    }

    uint256 _numDynamicFields = fieldLayout.numDynamicFields();
    if (_numDynamicFields > MAX_DYNAMIC_FIELDS) {
      revert IFieldLayoutErrors.FieldLayout_TooManyDynamicFields(_numDynamicFields, MAX_DYNAMIC_FIELDS);
    }

    uint256 _numStaticFields = fieldLayout.numStaticFields();
    uint256 _numTotalFields = _numStaticFields + _numDynamicFields;
    if (_numTotalFields > MAX_TOTAL_FIELDS) {
      revert IFieldLayoutErrors.FieldLayout_TooManyFields(_numTotalFields, MAX_TOTAL_FIELDS);
    }

    // Static lengths must be valid
    uint256 _staticDataLength;
    for (uint256 i; i < _numStaticFields; ) {
      uint256 staticByteLength = fieldLayout.atIndex(i);
      if (staticByteLength == 0) {
        revert IFieldLayoutErrors.FieldLayout_StaticLengthIsZero(i);
      } else if (staticByteLength > WORD_SIZE) {
        revert IFieldLayoutErrors.FieldLayout_StaticLengthDoesNotFitInAWord(i);
      }
      _staticDataLength += staticByteLength;
      unchecked {
        i++;
      }
    }
    // Static length sums must match
    if (_staticDataLength != fieldLayout.staticDataLength()) {
      revert IFieldLayoutErrors.FieldLayout_InvalidStaticDataLength(fieldLayout.staticDataLength(), _staticDataLength);
    }
    // Unused fields must be zero
    for (uint256 i = _numStaticFields; i < MAX_TOTAL_FIELDS; i++) {
      uint256 staticByteLength = fieldLayout.atIndex(i);
      if (staticByteLength != 0) {
        revert IFieldLayoutErrors.FieldLayout_StaticLengthIsNotZero(i);
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
