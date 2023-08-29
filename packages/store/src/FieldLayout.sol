// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// - 2 bytes for total length of all static fields
// - 1 byte for number of static size fields
// - 1 byte for number of dynamic size fields
// - 28 bytes for 28 static field lengths
// (MAX_DYNAMIC_FIELDS allows PackedCounter to pack the dynamic lengths into 1 word)
type FieldLayout is bytes32;

using FieldLayoutInstance for FieldLayout global;

/**
 * Static functions for FieldLayout
 */
library FieldLayoutLib {
  error FieldLayoutLib_InvalidLength(uint256 length);
  error FieldLayoutLib_StaticTypeIsZero();
  error FieldLayoutLib_StaticTypeDoesNotFitInAWord();

  // Based on PackedCounter's capacity
  uint256 internal constant MAX_DYNAMIC_FIELDS = 5;

  /**
   * Encode the given field layout into a single bytes32
   */
  function encode(uint256[] memory _staticFields, uint256 numDynamicFields) internal pure returns (FieldLayout) {
    uint256 fieldLayout;
    uint256 totalLength;
    uint256 totalFields = _staticFields.length + numDynamicFields;
    if (totalFields > 28) revert FieldLayoutLib_InvalidLength(totalFields);
    if (numDynamicFields > MAX_DYNAMIC_FIELDS) revert FieldLayoutLib_InvalidLength(numDynamicFields);

    // Compute the total static length and store the field lengths in the encoded fieldLayout
    for (uint256 i = 0; i < _staticFields.length; ) {
      uint256 staticByteLength = _staticFields[i];
      if (staticByteLength == 0) {
        revert FieldLayoutLib_StaticTypeIsZero();
      } else if (staticByteLength > 32) {
        revert FieldLayoutLib_StaticTypeDoesNotFitInAWord();
      }

      unchecked {
        // (safe because 28 (max _staticFields.length) * 32 (max static length) < 2**16)
        totalLength += staticByteLength;
        // Sequentially store lengths after the first 4 bytes (which are reserved for total length and field numbers)
        // (safe because of the initial _staticFields.length check)
        fieldLayout |= uint256(_staticFields[i]) << ((31 - 4 - i) * 8);
        i++;
      }
    }

    // Store total static length in the first 2 bytes,
    // number of static fields in the 3rd byte,
    // number of dynamic fields in the 4th byte
    // (optimizer can handle this, no need for unchecked or single-line assignment)
    fieldLayout |= totalLength << ((32 - 2) * 8);
    fieldLayout |= _staticFields.length << ((32 - 2 - 1) * 8);
    fieldLayout |= numDynamicFields << ((32 - 2 - 1 - 1) * 8);

    return FieldLayout.wrap(bytes32(fieldLayout));
  }
}

/**
 * Instance functions for FieldLayout
 */
library FieldLayoutInstance {
  /**
   * Get the total static byte length for the given field layout
   */
  function staticDataLength(FieldLayout fieldLayout) internal pure returns (uint256) {
    return uint256(FieldLayout.unwrap(fieldLayout)) >> ((32 - 2) * 8);
  }

  /**
   * Get the static byte length at the given index
   */
  function atIndex(FieldLayout fieldLayout, uint256 index) internal pure returns (uint256) {
    unchecked {
      return uint8(uint256(fieldLayout.unwrap()) >> ((31 - 4 - index) * 8));
    }
  }

  /**
   * Get the number of dynamic length fields for the field layout
   */
  function numDynamicFields(FieldLayout fieldLayout) internal pure returns (uint256) {
    return uint8(uint256(fieldLayout.unwrap()) >> ((31 - 3) * 8));
  }

  /**
   * Get the number of static fields for the field layout
   */
  function numStaticFields(FieldLayout fieldLayout) internal pure returns (uint256) {
    return uint8(uint256(fieldLayout.unwrap()) >> ((31 - 2) * 8));
  }

  /**
   * Get the total number of fields for the field layout
   */
  function numFields(FieldLayout fieldLayout) internal pure returns (uint256) {
    unchecked {
      return
        uint8(uint256(fieldLayout.unwrap()) >> ((31 - 3) * 8)) + uint8(uint256(fieldLayout.unwrap()) >> ((31 - 2) * 8));
    }
  }

  /**
   * Check if the field layout is empty
   */
  function isEmpty(FieldLayout fieldLayout) internal pure returns (bool) {
    return FieldLayout.unwrap(fieldLayout) == bytes32(0);
  }

  function validate(FieldLayout fieldLayout, bool allowEmpty) internal pure {
    // FieldLayout must not be empty
    if (!allowEmpty && fieldLayout.isEmpty()) revert FieldLayoutLib.FieldLayoutLib_InvalidLength(0);

    // FieldLayout must have no more than MAX_DYNAMIC_FIELDS
    uint256 _numDynamicFields = fieldLayout.numDynamicFields();
    if (_numDynamicFields > FieldLayoutLib.MAX_DYNAMIC_FIELDS)
      revert FieldLayoutLib.FieldLayoutLib_InvalidLength(_numDynamicFields);

    uint256 _numStaticFields = fieldLayout.numStaticFields();
    // FieldLayout must not have more than 28 lengths in total
    uint256 _numTotalFields = _numStaticFields + _numDynamicFields;
    if (_numTotalFields > 28) revert FieldLayoutLib.FieldLayoutLib_InvalidLength(_numTotalFields);

    // Static lengths must be valid
    for (uint256 i; i < _numStaticFields; ) {
      uint256 staticByteLength = fieldLayout.atIndex(i);
      if (staticByteLength == 0) {
        revert FieldLayoutLib.FieldLayoutLib_StaticTypeIsZero();
      } else if (staticByteLength > 32) {
        revert FieldLayoutLib.FieldLayoutLib_StaticTypeDoesNotFitInAWord();
      }
      unchecked {
        i++;
      }
    }
  }

  /**
   * Unwrap the field layout
   */
  function unwrap(FieldLayout fieldLayout) internal pure returns (bytes32) {
    return FieldLayout.unwrap(fieldLayout);
  }
}
