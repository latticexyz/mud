// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { Schema, SchemaLib } from "../src/Schema.sol";
import { SchemaEncodeHelper } from "./SchemaEncodeHelper.sol";

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

  function testFailInvalidSchemaStaticAfterDynamic() public pure {
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

  function testFailValidate() public pure {
    Schema.wrap(keccak256("some invalid schema")).validate({ allowEmpty: false });
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
