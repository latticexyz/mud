// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { stdError } from "forge-std/StdError.sol";
import { SchemaType } from "../../src/solidity/SchemaType.sol";

contract SchemaTypeTest is Test {
  uint256 internal constant SCHEMA_TYPE_LENGTH = 198;

  function testGetStaticByteLength() public {
    uint8 schemaType = 0;
    for (uint256 length = 1; length <= 32; length++) {
      assertEq(SchemaType(schemaType).getStaticByteLength(), length, "uint");
      schemaType++;
    }
    for (uint256 length = 1; length <= 32; length++) {
      assertEq(SchemaType(schemaType).getStaticByteLength(), length, "int");
      schemaType++;
    }
    for (uint256 length = 1; length <= 32; length++) {
      assertEq(SchemaType(schemaType).getStaticByteLength(), length, "bytes");
      schemaType++;
    }
    assertEq(SchemaType(schemaType).getStaticByteLength(), 1, "bool");
    schemaType++;
    assertEq(SchemaType(schemaType).getStaticByteLength(), 20, "address");
    schemaType++;

    // all dynamic types must have static length == 0
    for (uint256 i; i < 32 * 3; i++) {
      assertEq(SchemaType(schemaType).getStaticByteLength(), 0, "uint, int, bytes arrays");
      schemaType++;
    }
    assertEq(SchemaType(schemaType).getStaticByteLength(), 0, "bool array");
    schemaType++;
    assertEq(SchemaType(schemaType).getStaticByteLength(), 0, "address array");
    schemaType++;
    assertEq(SchemaType(schemaType).getStaticByteLength(), 0, "dynamic bytes");
    schemaType++;
    assertEq(SchemaType(schemaType).getStaticByteLength(), 0, "dynamic string");
    schemaType++;

    // expected length of the enum
    assertEq(schemaType, SCHEMA_TYPE_LENGTH);
  }

  function testSchemaTypeMaxLength() public {
    assertEq(SchemaType(SCHEMA_TYPE_LENGTH - 1).getStaticByteLength(), 0);
  }

  function testSchemaTypeOverMaxLength() public {
    vm.expectRevert(stdError.enumConversionError);
    SchemaType(SCHEMA_TYPE_LENGTH).getStaticByteLength();
  }
}
