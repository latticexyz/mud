// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Schema, SchemaLib } from "../src/Schema.sol";
import { SchemaEncodeHelper } from "./SchemaEncodeHelper.sol";

// TODO add tests for all schema types
contract SchemaTest is Test, GasReporter {
  function testEncodeDecodeSchema() public {
    startGasReport("initialize schema array with 6 entries");
    uint256[] memory _schema = new uint256[](5);
    _schema[0] = 1;
    _schema[1] = 2;
    _schema[2] = 4;
    _schema[3] = 16;
    _schema[4] = 32;
    endGasReport();

    startGasReport("encode schema with 6 entries");
    Schema schema = SchemaLib.encode(_schema, 1);
    endGasReport();

    startGasReport("get static byte length at index");
    uint256 staticByteLength = schema.atIndex(0);
    endGasReport();

    assertEq(staticByteLength, 1);
    assertEq(schema.atIndex(1), 2);
    assertEq(schema.atIndex(2), 4);
    assertEq(schema.atIndex(3), 16);
    assertEq(schema.atIndex(4), 32);
    assertEq(schema.atIndex(5), 0);
  }

  function testInvalidSchemaStaticTypeIsZero() public {
    vm.expectRevert(SchemaLib.SchemaLib_StaticTypeIsZero.selector);
    SchemaEncodeHelper.encode(1, 0, 1);
  }

  function testInvalidSchemaStaticTypeDoesNotFitInAWord() public {
    vm.expectRevert(SchemaLib.SchemaLib_StaticTypeDoesNotFitInAWord.selector);
    SchemaEncodeHelper.encode(1, 33, 1);
  }

  function testEncodeMaxValidLength() public {
    uint256[] memory schema = new uint256[](23);
    schema[0] = 32;
    schema[1] = 32;
    schema[2] = 32;
    schema[3] = 32;
    schema[4] = 32;
    schema[5] = 32;
    schema[6] = 32;
    schema[7] = 32;
    schema[8] = 32;
    schema[9] = 32;
    schema[10] = 32;
    schema[11] = 32;
    schema[12] = 32;
    schema[13] = 32;
    schema[14] = 32;
    schema[15] = 32;
    schema[16] = 32;
    schema[17] = 32;
    schema[18] = 32;
    schema[19] = 32;
    schema[20] = 32;
    schema[21] = 32;
    schema[22] = 32;
    Schema encodedSchema = SchemaLib.encode(schema, 5);

    assertEq(encodedSchema.numStaticFields() + encodedSchema.numDynamicFields(), 28);
  }

  function testFailEncodeTooLong() public pure {
    uint256[] memory schema = new uint256[](17);
    schema[0] = 32;
    schema[1] = 32;
    schema[2] = 32;
    schema[3] = 32;
    schema[4] = 32;
    schema[5] = 32;
    schema[6] = 32;
    schema[7] = 32;
    schema[8] = 32;
    schema[9] = 32;
    schema[10] = 32;
    schema[11] = 32;
    schema[12] = 32;
    schema[13] = 32;
    schema[14] = 32;
    schema[15] = 32;
    schema[16] = 32;
    SchemaLib.encode(schema, 12);
  }

  function testEncodeMaxValidDynamic() public {
    uint256[] memory schema = new uint256[](0);
    Schema encodedSchema = SchemaLib.encode(schema, 5);

    assertEq(encodedSchema.numDynamicFields(), 5);
  }

  function testFailEncodeTooManyDynamic() public pure {
    uint256[] memory schema = new uint256[](0);
    SchemaLib.encode(schema, 6);
  }

  function testGetStaticSchemaLength() public {
    Schema schema = SchemaEncodeHelper.encode(1, 2, 4, 16, 32, 1);

    startGasReport("get static data length from schema");
    uint256 length = schema.staticDataLength();
    endGasReport();

    assertEq(length, 55);
  }

  function testGetNumStaticFields() public {
    Schema schema = SchemaEncodeHelper.encode(1, 2, 4, 16, 32, 1);

    startGasReport("get number of static fields from schema");
    uint256 num = schema.numStaticFields();
    endGasReport();

    assertEq(num, 5);
  }

  function testGetNumDynamicFields() public {
    Schema schema = SchemaEncodeHelper.encode(1, 2, 4, 16, 32, 1);

    startGasReport("get number of dynamic fields from schema");
    uint256 num = schema.numDynamicFields();
    endGasReport();

    assertEq(num, 1);
  }

  function testGetNumFields() public {
    Schema schema = SchemaEncodeHelper.encode(1, 2, 4, 16, 32, 1);

    startGasReport("get number of all fields from schema");
    uint256 num = schema.numFields();
    endGasReport();

    assertEq(num, 6);
  }

  function testValidate() public {
    uint256[] memory schema = new uint256[](23);
    schema[0] = 32;
    schema[1] = 32;
    schema[2] = 32;
    schema[3] = 32;
    schema[4] = 32;
    schema[5] = 32;
    schema[6] = 32;
    schema[7] = 32;
    schema[8] = 32;
    schema[9] = 32;
    schema[10] = 32;
    schema[11] = 32;
    schema[12] = 32;
    schema[13] = 32;
    schema[14] = 32;
    schema[15] = 32;
    schema[16] = 32;
    schema[17] = 32;
    schema[18] = 32;
    schema[19] = 32;
    schema[20] = 32;
    schema[21] = 32;
    schema[22] = 32;
    Schema encodedSchema = SchemaLib.encode(schema, 5);

    startGasReport("validate schema");
    encodedSchema.validate({ allowEmpty: false });
    endGasReport();
  }

  function testFailValidate() public pure {
    Schema.wrap(keccak256("some invalid schema")).validate({ allowEmpty: false });
  }

  function testIsEmptyTrue() public {
    uint256[] memory schema = new uint256[](0);
    Schema encodedSchema = SchemaLib.encode(schema, 0);

    startGasReport("check if schema is empty (empty schema)");
    bool empty = encodedSchema.isEmpty();
    endGasReport();

    assertTrue(empty);
  }

  function testIsEmptyFalse() public {
    Schema encodedSchema = SchemaEncodeHelper.encode(32, 0);

    startGasReport("check if schema is empty (non-empty schema)");
    bool empty = encodedSchema.isEmpty();
    endGasReport();

    assertFalse(empty);
  }
}
