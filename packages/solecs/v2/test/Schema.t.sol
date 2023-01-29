// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Schema, Schema_ } from "../Schema.sol";
import { SchemaType } from "../Types.sol";

contract SchemaTest is DSTestPlus {
  function testEncodeDecodeSchema() public {
    uint256 gas = gasleft();
    Schema schema = Schema_.encode(
      SchemaType.Uint8, // 1 byte
      SchemaType.Uint16, // 2 bytes
      SchemaType.Uint32, // 4 bytes
      SchemaType.Uint128, // 16 bytes
      SchemaType.Uint256, // 32 bytes
      SchemaType.Uint32Array // 0 bytes (because it's dynamic)
    );
    gas = gas - gasleft();
    console.log("gas used (encode): %s", gas);

    gas = gasleft();
    SchemaType schemaType1 = schema.atIndex(0);
    gas = gas - gasleft();
    console.log("gas used (decode): %s", gas);

    assertEq(uint8(schemaType1), uint8(SchemaType.Uint8));
    assertEq(uint8(schema.atIndex(1)), uint8(SchemaType.Uint16));
    assertEq(uint8(schema.atIndex(2)), uint8(SchemaType.Uint32));
    assertEq(uint8(schema.atIndex(3)), uint8(SchemaType.Uint128));
    assertEq(uint8(schema.atIndex(4)), uint8(SchemaType.Uint256));
    assertEq(uint8(schema.atIndex(5)), uint8(SchemaType.Uint32Array));
  }

  function testFailInvalidSchemaStaticAfterDynamic() public pure {
    Schema_.encode(SchemaType.Uint8, SchemaType.Uint32Array, SchemaType.Uint16);
  }

  function testEncodeMaxValidLength() public {
    SchemaType[] memory schema = new SchemaType[](28);
    schema[0] = SchemaType.Uint256;
    schema[1] = SchemaType.Uint256;
    schema[2] = SchemaType.Uint256;
    schema[3] = SchemaType.Uint256;
    schema[4] = SchemaType.Uint256;
    schema[5] = SchemaType.Uint256;
    schema[6] = SchemaType.Uint256;
    schema[7] = SchemaType.Uint256;
    schema[8] = SchemaType.Uint256;
    schema[9] = SchemaType.Uint256;
    schema[10] = SchemaType.Uint256;
    schema[11] = SchemaType.Uint256;
    schema[12] = SchemaType.Uint256;
    schema[13] = SchemaType.Uint256;
    schema[14] = SchemaType.Uint32Array;
    schema[15] = SchemaType.Uint32Array;
    schema[16] = SchemaType.Uint32Array;
    schema[17] = SchemaType.Uint32Array;
    schema[18] = SchemaType.Uint32Array;
    schema[19] = SchemaType.Uint32Array;
    schema[20] = SchemaType.Uint32Array;
    schema[21] = SchemaType.Uint32Array;
    schema[22] = SchemaType.Uint32Array;
    schema[23] = SchemaType.Uint32Array;
    schema[24] = SchemaType.Uint32Array;
    schema[25] = SchemaType.Uint32Array;
    schema[26] = SchemaType.Uint32Array;
    schema[27] = SchemaType.Uint32Array;
    Schema encodedSchema = Schema_.encode(schema);

    assertEq(encodedSchema.numStaticFields() + encodedSchema.numDynamicFields(), 28);
  }

  function testFailEncodeTooLong() public pure {
    SchemaType[] memory schema = new SchemaType[](29);
    schema[0] = SchemaType.Uint256;
    schema[1] = SchemaType.Uint256;
    schema[2] = SchemaType.Uint256;
    schema[3] = SchemaType.Uint256;
    schema[4] = SchemaType.Uint256;
    schema[5] = SchemaType.Uint256;
    schema[6] = SchemaType.Uint256;
    schema[7] = SchemaType.Uint256;
    schema[8] = SchemaType.Uint256;
    schema[9] = SchemaType.Uint256;
    schema[10] = SchemaType.Uint256;
    schema[11] = SchemaType.Uint256;
    schema[12] = SchemaType.Uint256;
    schema[13] = SchemaType.Uint256;
    schema[14] = SchemaType.Uint256;
    schema[15] = SchemaType.Uint256;
    schema[16] = SchemaType.Uint256;
    schema[17] = SchemaType.Uint32Array;
    schema[18] = SchemaType.Uint32Array;
    schema[19] = SchemaType.Uint32Array;
    schema[20] = SchemaType.Uint32Array;
    schema[21] = SchemaType.Uint32Array;
    schema[22] = SchemaType.Uint32Array;
    schema[23] = SchemaType.Uint32Array;
    schema[24] = SchemaType.Uint32Array;
    schema[25] = SchemaType.Uint32Array;
    schema[26] = SchemaType.Uint32Array;
    schema[27] = SchemaType.Uint32Array;
    schema[28] = SchemaType.Uint32Array;
    Schema_.encode(schema);
  }

  function testEncodeMaxValidDynamic() public {
    SchemaType[] memory schema = new SchemaType[](14);
    schema[0] = SchemaType.Uint32Array;
    schema[1] = SchemaType.Uint32Array;
    schema[2] = SchemaType.Uint32Array;
    schema[3] = SchemaType.Uint32Array;
    schema[4] = SchemaType.Uint32Array;
    schema[5] = SchemaType.Uint32Array;
    schema[6] = SchemaType.Uint32Array;
    schema[7] = SchemaType.Uint32Array;
    schema[8] = SchemaType.Uint32Array;
    schema[9] = SchemaType.Uint32Array;
    schema[10] = SchemaType.Uint32Array;
    schema[11] = SchemaType.Uint32Array;
    schema[12] = SchemaType.Uint32Array;
    schema[13] = SchemaType.Uint32Array;
    Schema encodedSchema = Schema_.encode(schema);

    assertEq(encodedSchema.numDynamicFields(), 14);
  }

  function testFailEncodeTooManyDynamic() public pure {
    SchemaType[] memory schema = new SchemaType[](15);
    schema[0] = SchemaType.Uint32Array;
    schema[1] = SchemaType.Uint32Array;
    schema[2] = SchemaType.Uint32Array;
    schema[3] = SchemaType.Uint32Array;
    schema[4] = SchemaType.Uint32Array;
    schema[5] = SchemaType.Uint32Array;
    schema[6] = SchemaType.Uint32Array;
    schema[7] = SchemaType.Uint32Array;
    schema[8] = SchemaType.Uint32Array;
    schema[9] = SchemaType.Uint32Array;
    schema[10] = SchemaType.Uint32Array;
    schema[11] = SchemaType.Uint32Array;
    schema[12] = SchemaType.Uint32Array;
    schema[13] = SchemaType.Uint32Array;
    schema[14] = SchemaType.Uint32Array;
    Schema_.encode(schema);
  }

  function testGetStaticSchemaLength() public {
    Schema schema = Schema_.encode(
      SchemaType.Uint8, // 1 byte
      SchemaType.Uint16, // 2 bytes
      SchemaType.Uint32, // 4 bytes
      SchemaType.Uint128, // 16 bytes
      SchemaType.Uint256, // 32 bytes
      SchemaType.Uint32Array // 0 bytes (because it's dynamic)
    );

    uint256 gas = gasleft();
    uint256 length = schema.staticDataLength();
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    assertEq(length, 55);
  }

  function testGetNumStaticFields() public {
    Schema schema = Schema_.encode(
      SchemaType.Uint8, // 1 byte
      SchemaType.Uint16, // 2 bytes
      SchemaType.Uint32, // 4 bytes
      SchemaType.Uint128, // 16 bytes
      SchemaType.Uint256, // 32 bytes
      SchemaType.Uint32Array // 0 bytes (because it's dynamic)
    );

    uint256 gas = gasleft();
    uint256 num = schema.numStaticFields();
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    assertEq(num, 5);
  }

  function testGetNumDynamicFields() public {
    Schema schema = Schema_.encode(
      SchemaType.Uint8, // 1 byte
      SchemaType.Uint16, // 2 bytes
      SchemaType.Uint32, // 4 bytes
      SchemaType.Uint128, // 16 bytes
      SchemaType.Uint256, // 32 bytes
      SchemaType.Uint32Array // 0 bytes (because it's dynamic)
    );

    uint256 gas = gasleft();
    uint256 num = schema.numDynamicFields();
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    assertEq(num, 1);
  }

  function testValidate() public view {
    SchemaType[] memory schema = new SchemaType[](28);
    schema[0] = SchemaType.Uint256;
    schema[1] = SchemaType.Uint256;
    schema[2] = SchemaType.Uint256;
    schema[3] = SchemaType.Uint256;
    schema[4] = SchemaType.Uint256;
    schema[5] = SchemaType.Uint256;
    schema[6] = SchemaType.Uint256;
    schema[7] = SchemaType.Uint256;
    schema[8] = SchemaType.Uint256;
    schema[9] = SchemaType.Uint256;
    schema[10] = SchemaType.Uint256;
    schema[11] = SchemaType.Uint256;
    schema[12] = SchemaType.Uint256;
    schema[13] = SchemaType.Uint256;
    schema[14] = SchemaType.Uint32Array;
    schema[15] = SchemaType.Uint32Array;
    schema[16] = SchemaType.Uint32Array;
    schema[17] = SchemaType.Uint32Array;
    schema[18] = SchemaType.Uint32Array;
    schema[19] = SchemaType.Uint32Array;
    schema[20] = SchemaType.Uint32Array;
    schema[21] = SchemaType.Uint32Array;
    schema[22] = SchemaType.Uint32Array;
    schema[23] = SchemaType.Uint32Array;
    schema[24] = SchemaType.Uint32Array;
    schema[25] = SchemaType.Uint32Array;
    schema[26] = SchemaType.Uint32Array;
    schema[27] = SchemaType.Uint32Array;
    Schema encodedSchema = Schema_.encode(schema);
    encodedSchema.validate();
  }

  function testFailValidate() public view {
    Schema.wrap(keccak256("some invalid schema")).validate();
  }
}
