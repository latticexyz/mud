// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Bytes } from "./Bytes.sol";

// - 2 bytes static length of the schema
// - 1 byte for number of static size fields
// - 1 byte for number of dynamic size fields
// - 28 bytes for 28 schema types (MAX_DYNAMIC_FIELDS allows us to pack the lengths into 1 word)
type Schema is bytes32;

using SchemaInstance for Schema global;

/**
 * Static functions for Schema
 */
library SchemaLib {
  error SchemaLib_InvalidLength(uint256 length);
  error SchemaLib_StaticTypeIsZero();
  error SchemaLib_StaticTypeDoesNotFitInAWord();

  // Based on PackedCounter's capacity
  uint256 internal constant MAX_DYNAMIC_FIELDS = 5;

  /**
   * Encode the given schema into a single bytes32
   */
  function encode(uint256[] memory _staticFields, uint256 numDynamicFields) internal pure returns (Schema) {
    uint256 schema;
    uint256 totalLength;
    uint256 totalFields = _staticFields.length + numDynamicFields;
    if (totalFields > 28) revert SchemaLib_InvalidLength(totalFields);
    if (numDynamicFields > MAX_DYNAMIC_FIELDS) revert SchemaLib_InvalidLength(numDynamicFields);

    // Compute the length of the schema and the number of static fields
    // and store the schema types in the encoded schema
    for (uint256 i = 0; i < _staticFields.length; ) {
      uint256 staticByteLength = _staticFields[i];
      if (staticByteLength == 0) {
        revert SchemaLib_StaticTypeIsZero();
      } else if (staticByteLength > 32) {
        revert SchemaLib_StaticTypeDoesNotFitInAWord();
      }

      unchecked {
        // (safe because 28 (max _staticFields.length) * 32 (max static length) < 2**16)
        totalLength += staticByteLength;
        // Sequentially store schema types after the first 4 bytes (which are reserved for length and field numbers)
        // (safe because of the initial _staticFields.length check)
        schema |= uint256(_staticFields[i]) << ((31 - 4 - i) * 8);
        i++;
      }
    }

    // Store total static length in the first 2 bytes,
    // number of static fields in the 3rd byte,
    // number of dynamic fields in the 4th byte
    // (optimizer can handle this, no need for unchecked or single-line assignment)
    schema |= totalLength << ((32 - 2) * 8);
    schema |= _staticFields.length << ((32 - 2 - 1) * 8);
    schema |= numDynamicFields << ((32 - 2 - 1 - 1) * 8);

    return Schema.wrap(bytes32(schema));
  }
}

/**
 * Instance functions for Schema
 */
library SchemaInstance {
  /**
   * Get the total static byte length for the given schema
   */
  function staticDataLength(Schema schema) internal pure returns (uint256) {
    return uint256(Schema.unwrap(schema)) >> ((32 - 2) * 8);
  }

  /**
   * Get the static byte length at the given index
   */
  function atIndex(Schema schema, uint256 index) internal pure returns (uint256) {
    unchecked {
      return uint8(uint256(schema.unwrap()) >> ((31 - 4 - index) * 8));
    }
  }

  /**
   * Get the number of dynamic length fields for the given schema
   */
  function numDynamicFields(Schema schema) internal pure returns (uint256) {
    return uint8(uint256(schema.unwrap()) >> ((31 - 3) * 8));
  }

  /**
   * Get the number of static fields for the given schema
   */
  function numStaticFields(Schema schema) internal pure returns (uint256) {
    return uint8(uint256(schema.unwrap()) >> ((31 - 2) * 8));
  }

  /**
   * Get the total number of fields for the given schema
   */
  function numFields(Schema schema) internal pure returns (uint256) {
    unchecked {
      return uint8(uint256(schema.unwrap()) >> ((31 - 3) * 8)) + uint8(uint256(schema.unwrap()) >> ((31 - 2) * 8));
    }
  }

  /**
   * Check if the given schema is empty
   */
  function isEmpty(Schema schema) internal pure returns (bool) {
    return Schema.unwrap(schema) == bytes32(0);
  }

  function validate(Schema schema, bool allowEmpty) internal pure {
    // Schema must not be empty
    if (!allowEmpty && schema.isEmpty()) revert SchemaLib.SchemaLib_InvalidLength(0);

    // Schema must have no more than MAX_DYNAMIC_FIELDS
    uint256 _numDynamicFields = schema.numDynamicFields();
    if (_numDynamicFields > SchemaLib.MAX_DYNAMIC_FIELDS) revert SchemaLib.SchemaLib_InvalidLength(_numDynamicFields);

    uint256 _numStaticFields = schema.numStaticFields();
    // Schema must not have more than 28 lengths in total
    uint256 _numTotalFields = _numStaticFields + _numDynamicFields;
    if (_numTotalFields > 28) revert SchemaLib.SchemaLib_InvalidLength(_numTotalFields);

    // Static lengths must be valid
    for (uint256 i; i < _numStaticFields; ) {
      uint256 staticByteLength = schema.atIndex(i);
      if (staticByteLength == 0) {
        revert SchemaLib.SchemaLib_StaticTypeIsZero();
      } else if (staticByteLength > 32) {
        revert SchemaLib.SchemaLib_StaticTypeDoesNotFitInAWord();
      }
      unchecked {
        i++;
      }
    }
  }

  /**
   * Unwrap the schema
   */
  function unwrap(Schema schema) internal pure returns (bytes32) {
    return Schema.unwrap(schema);
  }
}
