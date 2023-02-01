// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType, getStaticByteLength } from "./Types.sol";
import { Bytes } from "./Bytes.sol";

// - 2 bytes static length of the schema
// - 1 byte for number of static size fields
// - 1 byte for number of dynamic size fields
// - 28 bytes for 28 schema types (max 14 dynamic fields to we can pack their lengths into 1 word)
type Schema is bytes32;

using SchemaLib for Schema global;

library SchemaLib {
  error SchemaLibInvalidLength(uint256 length);
  error SchemaLibStaticTypeAfterDynamicType();

  /************************************************************************
   *
   *    STATIC FUNCTIONS
   *
   ************************************************************************/

  /**
   * Encode the given schema into a single bytes32
   */
  function encode(SchemaType[] memory _schema) internal pure returns (Schema) {
    if (_schema.length > 28) revert SchemaLibInvalidLength(_schema.length);
    bytes32 schema;
    uint16 length;
    uint8 staticFields;

    // Compute the length of the schema and the number of static fields
    // and store the schema types in the encoded schema
    bool hasDynamicFields;
    for (uint256 i = 0; i < _schema.length; ) {
      uint16 staticByteLength = uint16(getStaticByteLength(_schema[i]));

      // Increase the static field count if the field is static
      if (staticByteLength > 0) {
        // Revert if we have seen a dynamic field before, but now we see a static field
        if (hasDynamicFields) revert SchemaLibStaticTypeAfterDynamicType();
        staticFields++;
      } else {
        // Flag that we have seen a dynamic field
        hasDynamicFields = true;
      }

      length += staticByteLength;
      schema = Bytes.setBytes1(schema, i + 4, bytes1(uint8(_schema[i])));
      unchecked {
        i++;
      }
    }

    // Require max 14 dynamic fields
    uint8 dynamicFields = uint8(_schema.length) - staticFields;
    if (dynamicFields > 14) revert SchemaLibInvalidLength(dynamicFields);

    // Store total static length, and number of static and dynamic fields
    schema = Bytes.setBytes1(schema, 0, bytes1(bytes2(length))); // upper length byte
    schema = Bytes.setBytes1(schema, 1, bytes1(uint8(length))); // lower length byte
    schema = Bytes.setBytes1(schema, 2, bytes1(staticFields)); // number of static fields
    schema = Bytes.setBytes1(schema, 3, bytes1(dynamicFields)); // number of dynamic fields

    return Schema.wrap(schema);
  }

  // Overrides for encode functions
  function encode(SchemaType a) internal pure returns (Schema) {
    SchemaType[] memory schema = new SchemaType[](1);
    schema[0] = a;
    return encode(schema);
  }

  function encode(SchemaType a, SchemaType b) internal pure returns (Schema) {
    SchemaType[] memory schema = new SchemaType[](2);
    schema[0] = a;
    schema[1] = b;
    return encode(schema);
  }

  function encode(
    SchemaType a,
    SchemaType b,
    SchemaType c
  ) internal pure returns (Schema) {
    SchemaType[] memory schema = new SchemaType[](3);
    schema[0] = a;
    schema[1] = b;
    schema[2] = c;
    return encode(schema);
  }

  function encode(
    SchemaType a,
    SchemaType b,
    SchemaType c,
    SchemaType d
  ) internal pure returns (Schema) {
    SchemaType[] memory schema = new SchemaType[](4);
    schema[0] = a;
    schema[1] = b;
    schema[2] = c;
    schema[3] = d;
    return encode(schema);
  }

  function encode(
    SchemaType a,
    SchemaType b,
    SchemaType c,
    SchemaType d,
    SchemaType e
  ) internal pure returns (Schema) {
    SchemaType[] memory schema = new SchemaType[](5);
    schema[0] = a;
    schema[1] = b;
    schema[2] = c;
    schema[3] = d;
    schema[4] = e;
    return encode(schema);
  }

  function encode(
    SchemaType a,
    SchemaType b,
    SchemaType c,
    SchemaType d,
    SchemaType e,
    SchemaType f
  ) internal pure returns (Schema) {
    SchemaType[] memory schema = new SchemaType[](6);
    schema[0] = a;
    schema[1] = b;
    schema[2] = c;
    schema[3] = d;
    schema[4] = e;
    schema[5] = f;
    return encode(schema);
  }

  /************************************************************************
   *
   *    INSTANCE FUNCTIONS
   *
   ************************************************************************/

  /**
   * Get the length of the static data for the given schema
   */
  function staticDataLength(Schema schema) internal pure returns (uint256) {
    return uint256(uint16(bytes2(Schema.unwrap(schema))));
  }

  /**
   * Get the type of the data for the given schema at the given index
   */
  function atIndex(Schema schema, uint256 index) internal pure returns (SchemaType) {
    return SchemaType(uint8(Bytes.slice1(Schema.unwrap(schema), index + 4)));
  }

  /**
   * Get the number of dynamic length fields for the given schema
   */
  function numDynamicFields(Schema schema) internal pure returns (uint8) {
    return uint8(Bytes.slice1(Schema.unwrap(schema), 3));
  }

  /**
   * Get the number of static  fields for the given schema
   */
  function numStaticFields(Schema schema) internal pure returns (uint8) {
    return uint8(Bytes.slice1(Schema.unwrap(schema), 2));
  }

  /**
   * Check if the given schema is empty
   */
  function isEmpty(Schema schema) internal pure returns (bool) {
    return Schema.unwrap(schema) == bytes32(0);
  }

  function validate(Schema schema) internal view {
    // Schema must not be empty
    if (schema.isEmpty()) revert SchemaLibInvalidLength(0);

    // Schema must have no more than 14 dynamic fields
    uint256 _numDynamicFields = schema.numDynamicFields();
    if (_numDynamicFields > 14) revert SchemaLibInvalidLength(_numDynamicFields);

    uint256 _numStaticFields = schema.numStaticFields();
    // Schema must not have more than 28 fields in total
    if (_numStaticFields + _numDynamicFields > 28) revert SchemaLibInvalidLength(_numStaticFields + _numDynamicFields);

    // No static field can be after a dynamic field
    uint256 countStaticFields;
    uint256 countDynamicFields;
    for (uint256 i; i < _numStaticFields + _numDynamicFields; ) {
      if (getStaticByteLength(schema.atIndex(i)) > 0) {
        // Static field in dynamic part
        if (i >= _numStaticFields) revert SchemaLibStaticTypeAfterDynamicType();
        countStaticFields++;
      } else {
        // Dynamic field in static part
        if (i < _numStaticFields) revert SchemaLibStaticTypeAfterDynamicType();
        countDynamicFields++;
      }
      unchecked {
        i++;
      }
    }

    // Number of static fields must match
    if (countStaticFields != _numStaticFields) revert SchemaLibInvalidLength(countStaticFields);

    // Number of dynamic fields must match
    if (countDynamicFields != _numDynamicFields) revert SchemaLibInvalidLength(countDynamicFields);
  }

  /**
   * Unwrap the schema
   */
  function unwrap(Schema schema) internal pure returns (bytes32) {
    return Schema.unwrap(schema);
  }
}
