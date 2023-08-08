// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
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
  error SchemaLib_StaticTypeAfterDynamicType();

  // Based on PackedCounter's capacity
  uint256 internal constant MAX_DYNAMIC_FIELDS = 5;

  /**
   * Encode the given schema into a single bytes32
   */
  function encode(SchemaType[] memory _schema) internal pure returns (Schema) {
    if (_schema.length > 28) revert SchemaLib_InvalidLength(_schema.length);
    uint256 schema;
    uint256 totalLength;
    uint256 dynamicFields;

    // Compute the length of the schema and the number of static fields
    // and store the schema types in the encoded schema
    for (uint256 i = 0; i < _schema.length; ) {
      uint256 staticByteLength = _schema[i].getStaticByteLength();

      if (staticByteLength == 0) {
        // Increase the dynamic field count if the field is dynamic
        // (safe because of the initial _schema.length check)
        unchecked {
          dynamicFields++;
        }
      } else if (dynamicFields > 0) {
        // Revert if we have seen a dynamic field before, but now we see a static field
        revert SchemaLib_StaticTypeAfterDynamicType();
      }

      unchecked {
        // (safe because 28 (max _schema.length) * 32 (max static length) < 2**16)
        totalLength += staticByteLength;
        // Sequentially store schema types after the first 4 bytes (which are reserved for length and field numbers)
        // (safe because of the initial _schema.length check)
        schema |= uint256(_schema[i]) << ((31 - 4 - i) * 8);
        i++;
      }
    }

    // Require MAX_DYNAMIC_FIELDS
    if (dynamicFields > MAX_DYNAMIC_FIELDS) revert SchemaLib_InvalidLength(dynamicFields);

    // Get the static field count
    uint256 staticFields;
    unchecked {
      staticFields = _schema.length - dynamicFields;
    }

    // Store total static length in the first 2 bytes,
    // number of static fields in the 3rd byte,
    // number of dynamic fields in the 4th byte
    // (optimizer can handle this, no need for unchecked or single-line assignment)
    schema |= totalLength << ((32 - 2) * 8);
    schema |= staticFields << ((32 - 2 - 1) * 8);
    schema |= dynamicFields << ((32 - 2 - 1 - 1) * 8);

    return Schema.wrap(bytes32(schema));
  }
}

/**
 * Instance functions for Schema
 */
library SchemaInstance {
  /**
   * Get the length of the static data for the given schema
   */
  function staticDataLength(Schema schema) internal pure returns (uint256) {
    return uint256(Schema.unwrap(schema)) >> ((32 - 2) * 8);
  }

  /**
   * Get the type of the data for the given schema at the given index
   */
  function atIndex(Schema schema, uint256 index) internal pure returns (SchemaType) {
    unchecked {
      return SchemaType(uint8(uint256(schema.unwrap()) >> ((31 - 4 - index) * 8)));
    }
  }

  /**
   * Get the number of dynamic length fields for the given schema
   */
  function numDynamicFields(Schema schema) internal pure returns (uint8) {
    unchecked {
      return uint8(uint256(schema.unwrap()) >> ((31 - 3) * 8));
    }
  }

  /**
   * Get the number of static  fields for the given schema
   */
  function numStaticFields(Schema schema) internal pure returns (uint8) {
    unchecked {
      return uint8(uint256(schema.unwrap()) >> ((31 - 2) * 8));
    }
  }

  /**
   * Get the total number of fields for the given schema
   */
  function numFields(Schema schema) internal pure returns (uint8) {
    unchecked {
      return numStaticFields(schema) + numDynamicFields(schema);
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
    // Schema must not have more than 28 fields in total
    if (_numStaticFields + _numDynamicFields > 28)
      revert SchemaLib.SchemaLib_InvalidLength(_numStaticFields + _numDynamicFields);

    // No static field can be after a dynamic field
    uint256 countStaticFields;
    uint256 countDynamicFields;
    for (uint256 i; i < _numStaticFields + _numDynamicFields; ) {
      if (schema.atIndex(i).getStaticByteLength() > 0) {
        // Static field in dynamic part
        if (i >= _numStaticFields) revert SchemaLib.SchemaLib_StaticTypeAfterDynamicType();
        countStaticFields++;
      } else {
        // Dynamic field in static part
        if (i < _numStaticFields) revert SchemaLib.SchemaLib_StaticTypeAfterDynamicType();
        countDynamicFields++;
      }
      unchecked {
        i++;
      }
    }

    // Number of static fields must match
    if (countStaticFields != _numStaticFields) revert SchemaLib.SchemaLib_InvalidLength(countStaticFields);

    // Number of dynamic fields must match
    if (countDynamicFields != _numDynamicFields) revert SchemaLib.SchemaLib_InvalidLength(countDynamicFields);
  }

  /**
   * Unwrap the schema
   */
  function unwrap(Schema schema) internal pure returns (bytes32) {
    return Schema.unwrap(schema);
  }
}
