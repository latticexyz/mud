// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { WORD_LAST_INDEX, BYTE_TO_BITS, MAX_TOTAL_FIELDS, MAX_DYNAMIC_FIELDS, LayoutOffsets } from "./constants.sol";
import { ISchemaErrors } from "./ISchemaErrors.sol";

/**
 * @title Schema handling in Lattice
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Defines and handles the encoding/decoding of Schemas which describe the layout of data structures.
 * 2 bytes length of all the static (in size) fields in the schema
 * 1 byte for number of static size fields
 * 1 byte for number of dynamic size fields
 * 28 bytes for 28 schema types (MAX_DYNAMIC_FIELDS allows us to pack the lengths into 1 word)
 */
type Schema is bytes32;

using SchemaInstance for Schema global;

/**
 * @title SchemaLib
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Static utility functions for handling Schemas.
 */
library SchemaLib {
  /**
   * @notice Encodes a given schema into a single bytes32.
   * @param schemas The list of SchemaTypes that constitute the schema.
   * @return The encoded Schema.
   */
  function encode(SchemaType[] memory schemas) internal pure returns (Schema) {
    if (schemas.length > MAX_TOTAL_FIELDS) revert ISchemaErrors.Schema_InvalidLength(schemas.length);
    uint256 schema;
    uint256 totalLength;
    uint256 dynamicFields;

    // Compute the length of the schema and the number of static fields
    // and store the schema types in the encoded schema
    for (uint256 i = 0; i < schemas.length; ) {
      uint256 staticByteLength = schemas[i].getStaticByteLength();

      if (staticByteLength == 0) {
        // Increase the dynamic field count if the field is dynamic
        // (safe because of the initial _schema.length check)
        unchecked {
          dynamicFields++;
        }
      } else if (dynamicFields > 0) {
        // Revert if we have seen a dynamic field before, but now we see a static field
        revert ISchemaErrors.Schema_StaticTypeAfterDynamicType();
      }

      unchecked {
        // (safe because 28 (max _schema.length) * 32 (max static length) < 2**16)
        totalLength += staticByteLength;
        // Sequentially store schema types after the first 4 bytes (which are reserved for length and field numbers)
        // (safe because of the initial _schema.length check)
        schema |= uint256(schemas[i]) << ((WORD_LAST_INDEX - 4 - i) * BYTE_TO_BITS);
        i++;
      }
    }

    // Require MAX_DYNAMIC_FIELDS
    if (dynamicFields > MAX_DYNAMIC_FIELDS) revert ISchemaErrors.Schema_InvalidLength(dynamicFields);

    // Get the static field count
    uint256 staticFields;
    unchecked {
      staticFields = schemas.length - dynamicFields;
    }

    // Store total static length in the first 2 bytes,
    // number of static fields in the 3rd byte,
    // number of dynamic fields in the 4th byte
    // (optimizer can handle this, no need for unchecked or single-line assignment)
    schema |= totalLength << LayoutOffsets.TOTAL_LENGTH;
    schema |= staticFields << LayoutOffsets.NUM_STATIC_FIELDS;
    schema |= dynamicFields << LayoutOffsets.NUM_DYNAMIC_FIELDS;

    return Schema.wrap(bytes32(schema));
  }
}

/**
 * @title SchemaInstance
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Instance utility functions for handling a Schema instance.
 */
library SchemaInstance {
  /**
   * @notice Get the length of static data for the given schema.
   * @param schema The schema to inspect.
   * @return The static data length.
   */
  function staticDataLength(Schema schema) internal pure returns (uint256) {
    return uint256(Schema.unwrap(schema)) >> LayoutOffsets.TOTAL_LENGTH;
  }

  /**
   * @notice Get the SchemaType at a given index in the schema.
   * @param schema The schema to inspect.
   * @param index The index of the SchemaType to retrieve.
   * @return The SchemaType at the given index.
   */
  function atIndex(Schema schema, uint256 index) internal pure returns (SchemaType) {
    unchecked {
      return SchemaType(uint8(uint256(schema.unwrap()) >> ((WORD_LAST_INDEX - 4 - index) * 8)));
    }
  }

  /**
   * @notice Get the number of static (fixed length) fields in the schema.
   * @param schema The schema to inspect.
   * @return The number of static fields.
   */
  function numStaticFields(Schema schema) internal pure returns (uint256) {
    return uint8(uint256(schema.unwrap()) >> LayoutOffsets.NUM_STATIC_FIELDS);
  }

  /**
   * @notice Get the number of dynamic length fields in the schema.
   * @param schema The schema to inspect.
   * @return The number of dynamic length fields.
   */
  function numDynamicFields(Schema schema) internal pure returns (uint256) {
    return uint8(uint256(schema.unwrap()) >> LayoutOffsets.NUM_DYNAMIC_FIELDS);
  }

  /**
   * @notice Get the total number of fields in the schema.
   * @param schema The schema to inspect.
   * @return The total number of fields.
   */
  function numFields(Schema schema) internal pure returns (uint256) {
    unchecked {
      return
        uint8(uint256(schema.unwrap()) >> LayoutOffsets.NUM_STATIC_FIELDS) +
        uint8(uint256(schema.unwrap()) >> LayoutOffsets.NUM_DYNAMIC_FIELDS);
    }
  }

  /**
   * @notice Checks if the provided schema is empty.
   * @param schema The schema to check.
   * @return true if the schema is empty, false otherwise.
   */
  function isEmpty(Schema schema) internal pure returns (bool) {
    return Schema.unwrap(schema) == bytes32(0);
  }

  /**
   * @notice Validates the given schema.
   * @param schema The schema to validate.
   * @param allowEmpty Determines if an empty schema is valid or not.
   */
  function validate(Schema schema, bool allowEmpty) internal pure {
    // Schema must not be empty
    if (!allowEmpty && schema.isEmpty()) revert ISchemaErrors.Schema_InvalidLength(0);

    // Schema must have no more than MAX_DYNAMIC_FIELDS
    uint256 _numDynamicFields = schema.numDynamicFields();
    if (_numDynamicFields > MAX_DYNAMIC_FIELDS) revert ISchemaErrors.Schema_InvalidLength(_numDynamicFields);

    uint256 _numStaticFields = schema.numStaticFields();
    // Schema must not have more than MAX_TOTAL_FIELDS in total
    uint256 _numTotalFields = _numStaticFields + _numDynamicFields;
    if (_numTotalFields > MAX_TOTAL_FIELDS) revert ISchemaErrors.Schema_InvalidLength(_numTotalFields);

    // No dynamic field can be before a dynamic field
    uint256 _staticDataLength;
    for (uint256 i; i < _numStaticFields; ) {
      uint256 staticByteLength = schema.atIndex(i).getStaticByteLength();
      if (staticByteLength == 0) {
        revert ISchemaErrors.Schema_StaticTypeAfterDynamicType();
      }
      _staticDataLength += staticByteLength;
      unchecked {
        i++;
      }
    }

    // Static length sums must match
    if (_staticDataLength != schema.staticDataLength()) {
      revert ISchemaErrors.Schema_InvalidLength(schema.staticDataLength());
    }

    // No static field can be after a dynamic field
    for (uint256 i = _numStaticFields; i < _numTotalFields; ) {
      uint256 staticByteLength = schema.atIndex(i).getStaticByteLength();
      if (staticByteLength > 0) {
        revert ISchemaErrors.Schema_StaticTypeAfterDynamicType();
      }
      unchecked {
        i++;
      }
    }
  }

  /**
   * @notice Unwraps the schema to its underlying bytes32 representation.
   * @param schema The schema to unwrap.
   * @return The bytes32 representation of the schema.
   */
  function unwrap(Schema schema) internal pure returns (bytes32) {
    return Schema.unwrap(schema);
  }
}
