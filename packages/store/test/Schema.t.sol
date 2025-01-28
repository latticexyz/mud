// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { Schema, SchemaLib } from "../src/Schema.sol";
import { SchemaEncodeHelper } from "./SchemaEncodeHelper.sol";
import { WORD_LAST_INDEX, BYTE_TO_BITS, LayoutOffsets } from "../src/constants.sol";
import { ISchemaErrors } from "../src/ISchemaErrors.sol";

/**
 * @notice Encodes a given schema into a single bytes32, without checks.
 * @dev Used in testing to create invalid schemas that can be validated seperately.
 * @param schemas The list of SchemaTypes that constitute the schema.
 * @return The encoded Schema.
 */
function encodeUnsafe(SchemaType[] memory schemas) pure returns (Schema) {
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

// TODO add tests for all schema types
contract SchemaTest is Test, GasReporter {
  function testEncodeDecodeSchema() public {
    startGasReport("initialize schema array with 6 entries");
    SchemaType[] memory _schema = new SchemaType[](6);
    _schema[0] = SchemaType.UINT8; // 1 byte
    _schema[1] = SchemaType.UINT16; // 2 bytes
    _schema[2] = SchemaType.UINT32; // 4 bytes
    _schema[3] = SchemaType.UINT128; // 16 bytes
    _schema[4] = SchemaType.UINT256; // 32 bytes
    _schema[5] = SchemaType.UINT32_ARRAY; // 0 bytes (because it's dynamic)
    endGasReport();

    startGasReport("encode schema with 6 entries");
    Schema schema = SchemaLib.encode(_schema);
    endGasReport();

    startGasReport("get schema type at index");
    SchemaType schemaType1 = schema.atIndex(0);
    endGasReport();

    assertEq(uint8(schemaType1), uint8(SchemaType.UINT8));
    assertEq(uint8(schema.atIndex(1)), uint8(SchemaType.UINT16));
    assertEq(uint8(schema.atIndex(2)), uint8(SchemaType.UINT32));
    assertEq(uint8(schema.atIndex(3)), uint8(SchemaType.UINT128));
    assertEq(uint8(schema.atIndex(4)), uint8(SchemaType.UINT256));
    assertEq(uint8(schema.atIndex(5)), uint8(SchemaType.UINT32_ARRAY));
  }

  /// forge-config: default.allow_internal_expect_revert = true
  function testInvalidSchemaStaticAfterDynamic() public {
    vm.expectRevert(abi.encodeWithSelector(ISchemaErrors.Schema_StaticTypeAfterDynamicType.selector));
    SchemaEncodeHelper.encode(SchemaType.UINT8, SchemaType.UINT32_ARRAY, SchemaType.UINT16);
  }

  function testEncodeMaxValidLength() public {
    SchemaType[] memory schema = new SchemaType[](28);
    schema[0] = SchemaType.UINT256;
    schema[1] = SchemaType.UINT256;
    schema[2] = SchemaType.UINT256;
    schema[3] = SchemaType.UINT256;
    schema[4] = SchemaType.UINT256;
    schema[5] = SchemaType.UINT256;
    schema[6] = SchemaType.UINT256;
    schema[7] = SchemaType.UINT256;
    schema[8] = SchemaType.UINT256;
    schema[9] = SchemaType.UINT256;
    schema[10] = SchemaType.UINT256;
    schema[11] = SchemaType.UINT256;
    schema[12] = SchemaType.UINT256;
    schema[13] = SchemaType.UINT256;
    schema[14] = SchemaType.UINT256;
    schema[15] = SchemaType.UINT256;
    schema[16] = SchemaType.UINT256;
    schema[17] = SchemaType.UINT256;
    schema[18] = SchemaType.UINT256;
    schema[19] = SchemaType.UINT256;
    schema[20] = SchemaType.UINT256;
    schema[21] = SchemaType.UINT256;
    schema[22] = SchemaType.UINT256;
    schema[23] = SchemaType.UINT32_ARRAY;
    schema[24] = SchemaType.UINT32_ARRAY;
    schema[25] = SchemaType.UINT32_ARRAY;
    schema[26] = SchemaType.UINT32_ARRAY;
    schema[27] = SchemaType.UINT32_ARRAY;
    Schema encodedSchema = SchemaLib.encode(schema);

    assertEq(encodedSchema.numStaticFields() + encodedSchema.numDynamicFields(), 28);
  }

  /// forge-config: default.allow_internal_expect_revert = true
  function testEncodeTooLong() public {
    SchemaType[] memory schema = new SchemaType[](29);
    schema[0] = SchemaType.UINT256;
    schema[1] = SchemaType.UINT256;
    schema[2] = SchemaType.UINT256;
    schema[3] = SchemaType.UINT256;
    schema[4] = SchemaType.UINT256;
    schema[5] = SchemaType.UINT256;
    schema[6] = SchemaType.UINT256;
    schema[7] = SchemaType.UINT256;
    schema[8] = SchemaType.UINT256;
    schema[9] = SchemaType.UINT256;
    schema[10] = SchemaType.UINT256;
    schema[11] = SchemaType.UINT256;
    schema[12] = SchemaType.UINT256;
    schema[13] = SchemaType.UINT256;
    schema[14] = SchemaType.UINT256;
    schema[15] = SchemaType.UINT256;
    schema[16] = SchemaType.UINT256;
    schema[17] = SchemaType.UINT32_ARRAY;
    schema[18] = SchemaType.UINT32_ARRAY;
    schema[19] = SchemaType.UINT32_ARRAY;
    schema[20] = SchemaType.UINT32_ARRAY;
    schema[21] = SchemaType.UINT32_ARRAY;
    schema[22] = SchemaType.UINT32_ARRAY;
    schema[23] = SchemaType.UINT32_ARRAY;
    schema[24] = SchemaType.UINT32_ARRAY;
    schema[25] = SchemaType.UINT32_ARRAY;
    schema[26] = SchemaType.UINT32_ARRAY;
    schema[27] = SchemaType.UINT32_ARRAY;
    schema[28] = SchemaType.UINT32_ARRAY;
    vm.expectRevert(abi.encodeWithSelector(ISchemaErrors.Schema_InvalidLength.selector, schema.length));
    SchemaLib.encode(schema);
  }

  function testEncodeMaxValidDynamic() public {
    SchemaType[] memory schema = new SchemaType[](5);
    schema[0] = SchemaType.UINT32_ARRAY;
    schema[1] = SchemaType.UINT32_ARRAY;
    schema[2] = SchemaType.UINT32_ARRAY;
    schema[3] = SchemaType.UINT32_ARRAY;
    schema[4] = SchemaType.UINT32_ARRAY;
    Schema encodedSchema = SchemaLib.encode(schema);

    assertEq(encodedSchema.numDynamicFields(), 5);
  }

  /// forge-config: default.allow_internal_expect_revert = true
  function testEncodeTooManyDynamic() public {
    SchemaType[] memory schema = new SchemaType[](6);
    schema[0] = SchemaType.UINT32_ARRAY;
    schema[1] = SchemaType.UINT32_ARRAY;
    schema[2] = SchemaType.UINT32_ARRAY;
    schema[3] = SchemaType.UINT32_ARRAY;
    schema[4] = SchemaType.UINT32_ARRAY;
    schema[5] = SchemaType.UINT32_ARRAY;
    vm.expectRevert(abi.encodeWithSelector(ISchemaErrors.Schema_InvalidLength.selector, schema.length));
    SchemaLib.encode(schema);
  }

  function testGetStaticSchemaLength() public {
    Schema schema = SchemaEncodeHelper.encode(
      SchemaType.UINT8, // 1 byte
      SchemaType.UINT16, // 2 bytes
      SchemaType.UINT32, // 4 bytes
      SchemaType.UINT128, // 16 bytes
      SchemaType.UINT256, // 32 bytes
      SchemaType.UINT32_ARRAY // 0 bytes (because it's dynamic)
    );

    startGasReport("get static data length from schema");
    uint256 length = schema.staticDataLength();
    endGasReport();

    assertEq(length, 55);
  }

  function testGetNumStaticFields() public {
    Schema schema = SchemaEncodeHelper.encode(
      SchemaType.UINT8, // 1 byte
      SchemaType.UINT16, // 2 bytes
      SchemaType.UINT32, // 4 bytes
      SchemaType.UINT128, // 16 bytes
      SchemaType.UINT256, // 32 bytes
      SchemaType.UINT32_ARRAY // 0 bytes (because it's dynamic)
    );

    startGasReport("get number of static fields from schema");
    uint256 num = schema.numStaticFields();
    endGasReport();

    assertEq(num, 5);
  }

  function testGetNumDynamicFields() public {
    Schema schema = SchemaEncodeHelper.encode(
      SchemaType.UINT8, // 1 byte
      SchemaType.UINT16, // 2 bytes
      SchemaType.UINT32, // 4 bytes
      SchemaType.UINT128, // 16 bytes
      SchemaType.UINT256, // 32 bytes
      SchemaType.UINT32_ARRAY // 0 bytes (because it's dynamic)
    );

    startGasReport("get number of dynamic fields from schema");
    uint256 num = schema.numDynamicFields();
    endGasReport();

    assertEq(num, 1);
  }

  function testGetNumFields() public {
    Schema schema = SchemaEncodeHelper.encode(
      SchemaType.UINT8, // 1 byte
      SchemaType.UINT16, // 2 bytes
      SchemaType.UINT32, // 4 bytes
      SchemaType.UINT128, // 16 bytes
      SchemaType.UINT256, // 32 bytes
      SchemaType.UINT32_ARRAY // 0 bytes (because it's dynamic)
    );

    startGasReport("get number of all fields from schema");
    uint256 num = schema.numFields();
    endGasReport();

    assertEq(num, 6);
  }

  function testValidate() public {
    SchemaType[] memory schema = new SchemaType[](28);
    schema[0] = SchemaType.UINT256;
    schema[1] = SchemaType.UINT256;
    schema[2] = SchemaType.UINT256;
    schema[3] = SchemaType.UINT256;
    schema[4] = SchemaType.UINT256;
    schema[5] = SchemaType.UINT256;
    schema[6] = SchemaType.UINT256;
    schema[7] = SchemaType.UINT256;
    schema[8] = SchemaType.UINT256;
    schema[9] = SchemaType.UINT256;
    schema[10] = SchemaType.UINT256;
    schema[11] = SchemaType.UINT256;
    schema[12] = SchemaType.UINT256;
    schema[13] = SchemaType.UINT256;
    schema[14] = SchemaType.UINT256;
    schema[15] = SchemaType.UINT256;
    schema[16] = SchemaType.UINT256;
    schema[17] = SchemaType.UINT256;
    schema[18] = SchemaType.UINT256;
    schema[19] = SchemaType.UINT256;
    schema[20] = SchemaType.UINT256;
    schema[21] = SchemaType.UINT256;
    schema[22] = SchemaType.UINT256;
    schema[23] = SchemaType.UINT32_ARRAY;
    schema[24] = SchemaType.UINT32_ARRAY;
    schema[25] = SchemaType.UINT32_ARRAY;
    schema[26] = SchemaType.UINT32_ARRAY;
    schema[27] = SchemaType.UINT32_ARRAY;
    Schema encodedSchema = SchemaLib.encode(schema);

    startGasReport("validate schema");
    encodedSchema.validate({ allowEmpty: false });
    endGasReport();
  }

  /// forge-config: default.allow_internal_expect_revert = true
  function testValidateInvalidLength() public {
    Schema encodedSchema = Schema.wrap(keccak256("some invalid schema"));

    vm.expectRevert(
      abi.encodeWithSelector(ISchemaErrors.Schema_InvalidLength.selector, encodedSchema.numDynamicFields())
    );

    encodedSchema.validate({ allowEmpty: false });
  }

  /// forge-config: default.allow_internal_expect_revert = true
  function testValidateInvalidSchemaStaticAfterDynamic() public {
    SchemaType[] memory schema = new SchemaType[](28);
    schema[0] = SchemaType.UINT256;
    schema[1] = SchemaType.UINT256;
    schema[2] = SchemaType.UINT256;
    schema[3] = SchemaType.UINT256;
    schema[4] = SchemaType.UINT256;
    schema[5] = SchemaType.UINT256;
    schema[6] = SchemaType.UINT256;
    schema[7] = SchemaType.UINT256;
    schema[8] = SchemaType.UINT256;
    schema[9] = SchemaType.UINT256;
    schema[10] = SchemaType.UINT256;
    schema[11] = SchemaType.UINT256;
    schema[12] = SchemaType.UINT256;
    schema[13] = SchemaType.UINT256;
    schema[14] = SchemaType.UINT256;
    schema[15] = SchemaType.UINT256;
    schema[16] = SchemaType.UINT256;
    schema[17] = SchemaType.UINT256;
    schema[18] = SchemaType.UINT256;
    schema[19] = SchemaType.UINT256;
    schema[20] = SchemaType.UINT256;
    schema[21] = SchemaType.UINT256;
    schema[22] = SchemaType.UINT32_ARRAY;
    schema[23] = SchemaType.UINT256;
    schema[24] = SchemaType.UINT32_ARRAY;
    schema[25] = SchemaType.UINT32_ARRAY;
    schema[26] = SchemaType.UINT32_ARRAY;
    schema[27] = SchemaType.UINT32_ARRAY;
    Schema encodedSchema = encodeUnsafe(schema);

    vm.expectRevert(ISchemaErrors.Schema_StaticTypeAfterDynamicType.selector);

    encodedSchema.validate({ allowEmpty: false });
  }

  function testIsEmptyTrue() public {
    SchemaType[] memory schema = new SchemaType[](0);
    Schema encodedSchema = SchemaLib.encode(schema);

    startGasReport("check if schema is empty (empty schema)");
    bool empty = encodedSchema.isEmpty();
    endGasReport();

    assertTrue(empty);
  }

  function testIsEmptyFalse() public {
    Schema encodedSchema = SchemaEncodeHelper.encode(SchemaType.UINT256);

    startGasReport("check if schema is empty (non-empty schema)");
    bool empty = encodedSchema.isEmpty();
    endGasReport();

    assertFalse(empty);
  }
}
