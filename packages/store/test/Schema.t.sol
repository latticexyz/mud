// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { Schema, SchemaLib } from "../src/Schema.sol";

// TODO add tests for all schema types
contract SchemaTest is Test {
  function testEncodeDecodeSchema() public {
    uint256 gas = gasleft();
    Schema schema = SchemaLib.encode(
      SchemaType.UINT8, // 1 byte
      SchemaType.UINT16, // 2 bytes
      SchemaType.UINT32, // 4 bytes
      SchemaType.UINT128, // 16 bytes
      SchemaType.UINT256, // 32 bytes
      SchemaType.UINT32_ARRAY // 0 bytes (because it's dynamic)
    );
    gas = gas - gasleft();
    console.log("GAS REPORT: encode schema with 6 entries [SchemaLib.encode]: %s", gas);

    // !gasreport get schema type at index
    SchemaType schemaType1 = schema.atIndex(0);

    assertEq(uint8(schemaType1), uint8(SchemaType.UINT8));
    assertEq(uint8(schema.atIndex(1)), uint8(SchemaType.UINT16));
    assertEq(uint8(schema.atIndex(2)), uint8(SchemaType.UINT32));
    assertEq(uint8(schema.atIndex(3)), uint8(SchemaType.UINT128));
    assertEq(uint8(schema.atIndex(4)), uint8(SchemaType.UINT256));
    assertEq(uint8(schema.atIndex(5)), uint8(SchemaType.UINT32_ARRAY));
  }

  function testFailInvalidSchemaStaticAfterDynamic() public pure {
    SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT32_ARRAY, SchemaType.UINT16);
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

  function testFailEncodeTooLong() public pure {
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

  function testFailEncodeTooManyDynamic() public pure {
    SchemaType[] memory schema = new SchemaType[](6);
    schema[0] = SchemaType.UINT32_ARRAY;
    schema[1] = SchemaType.UINT32_ARRAY;
    schema[2] = SchemaType.UINT32_ARRAY;
    schema[3] = SchemaType.UINT32_ARRAY;
    schema[4] = SchemaType.UINT32_ARRAY;
    schema[5] = SchemaType.UINT32_ARRAY;
    SchemaLib.encode(schema);
  }

  function testGetStaticSchemaLength() public {
    Schema schema = SchemaLib.encode(
      SchemaType.UINT8, // 1 byte
      SchemaType.UINT16, // 2 bytes
      SchemaType.UINT32, // 4 bytes
      SchemaType.UINT128, // 16 bytes
      SchemaType.UINT256, // 32 bytes
      SchemaType.UINT32_ARRAY // 0 bytes (because it's dynamic)
    );

    // !gasreport get static data length from schema
    uint256 length = schema.staticDataLength();

    assertEq(length, 55);
  }

  function testGetNumStaticFields() public {
    Schema schema = SchemaLib.encode(
      SchemaType.UINT8, // 1 byte
      SchemaType.UINT16, // 2 bytes
      SchemaType.UINT32, // 4 bytes
      SchemaType.UINT128, // 16 bytes
      SchemaType.UINT256, // 32 bytes
      SchemaType.UINT32_ARRAY // 0 bytes (because it's dynamic)
    );

    // !gasreport get number of static fields from schema
    uint256 num = schema.numStaticFields();

    assertEq(num, 5);
  }

  function testGetNumDynamicFields() public {
    Schema schema = SchemaLib.encode(
      SchemaType.UINT8, // 1 byte
      SchemaType.UINT16, // 2 bytes
      SchemaType.UINT32, // 4 bytes
      SchemaType.UINT128, // 16 bytes
      SchemaType.UINT256, // 32 bytes
      SchemaType.UINT32_ARRAY // 0 bytes (because it's dynamic)
    );

    // !gasreport get number of dynamic fields from schema
    uint256 num = schema.numDynamicFields();

    assertEq(num, 1);
  }

  function testValidate() public pure {
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

    // !gasreport validate schema
    encodedSchema.validate({ allowEmpty: false });
  }

  function testFailValidate() public pure {
    Schema.wrap(keccak256("some invalid schema")).validate({ allowEmpty: false });
  }

  function testIsEmptyTrue() public {
    SchemaType[] memory schema = new SchemaType[](0);
    Schema encodedSchema = SchemaLib.encode(schema);

    // !gasreport check if schema is empty (empty schema)
    bool empty = encodedSchema.isEmpty();

    assertTrue(empty);
  }

  function testIsEmptyFalse() public {
    Schema encodedSchema = SchemaLib.encode(SchemaType.UINT256);

    // !gasreport check if schema is empty (non-empty schema)
    bool empty = encodedSchema.isEmpty();

    assertFalse(empty);
  }
}
