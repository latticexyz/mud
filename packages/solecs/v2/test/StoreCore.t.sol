// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { StoreCore } from "../StoreCore.sol";
import { Utils } from "../Utils.sol";
import { Bytes } from "../Bytes.sol";
import { SchemaType } from "../Types.sol";

contract StoreCoreTest is DSTestPlus {
  function testGetStaticDataLength() public {
    bytes32 schema = bytes32(
      bytes.concat(bytes2(uint16(3)), bytes1(uint8(SchemaType.Uint8)), bytes1(uint8(SchemaType.Uint16)))
    );

    uint256 gas = gasleft();
    uint256 length = StoreCore._getStaticDataLength(schema);
    gas = gas - gasleft();
    console.log("gas used: %s", gas);

    assertEq(length, 3);
  }

  function testEncodeDecodeSchema() public {
    SchemaType[] memory schema = new SchemaType[](6);
    schema[0] = SchemaType.Uint8; // 1 byte
    schema[1] = SchemaType.Uint16; // 2 bytes
    schema[2] = SchemaType.Uint32; // 4 bytes
    schema[3] = SchemaType.Uint128; // 4 bytes
    schema[4] = SchemaType.Uint256; // 4 bytes
    schema[5] = SchemaType.Uint32Array; // 0 bytes (because it's dynamic)

    uint256 gas = gasleft();
    bytes32 encodedSchema = StoreCore.encodeSchema(schema);
    gas = gas - gasleft();
    console.log("gas used (encode): %s", gas);

    gas = gasleft();
    uint256 length = StoreCore._getStaticDataLength(encodedSchema);
    gas = gas - gasleft();
    console.log("gas used (get length): %s", gas);

    gas = gasleft();
    SchemaType schemaType1 = StoreCore._getSchemaTypeAtIndex(encodedSchema, 0);
    gas = gas - gasleft();
    console.log("gas used (decode): %s", gas);

    assertEq(length, 55);
    assertEq(uint8(schemaType1), uint8(SchemaType.Uint8));
    assertEq(uint8(StoreCore._getSchemaTypeAtIndex(encodedSchema, 1)), uint8(SchemaType.Uint16));
    assertEq(uint8(StoreCore._getSchemaTypeAtIndex(encodedSchema, 2)), uint8(SchemaType.Uint32));
    assertEq(uint8(StoreCore._getSchemaTypeAtIndex(encodedSchema, 3)), uint8(SchemaType.Uint128));
    assertEq(uint8(StoreCore._getSchemaTypeAtIndex(encodedSchema, 4)), uint8(SchemaType.Uint256));
    assertEq(StoreCore._getNumStaticFields(encodedSchema), 5);
    assertEq(StoreCore._getNumDynamicFields(encodedSchema), 1);
  }

  function testRegisterAndGetSchema() public {
    bytes32 schema = bytes32(
      bytes.concat(
        bytes2(uint16(6)),
        bytes1(uint8(SchemaType.Uint8)),
        bytes1(uint8(SchemaType.Uint16)),
        bytes1(uint8(SchemaType.Uint8)),
        bytes1(uint8(SchemaType.Uint16))
      )
    );

    bytes32 table = keccak256("some.table");
    uint256 gas = gasleft();
    StoreCore.registerSchema(table, schema);
    gas = gas - gasleft();
    console.log("gas used (register): %s", gas);

    gas = gasleft();
    bytes memory loadedSchema = bytes.concat(StoreCore.getSchema(table));
    gas = gas - gasleft();
    console.log("gas used (get schema, warm): %s", gas);

    assertEq(loadedSchema.length, schema.length);
    assertEq(uint8(Bytes.slice1(loadedSchema, 2)), uint8(SchemaType.Uint8));
    assertEq(uint8(Bytes.slice1(loadedSchema, 3)), uint8(SchemaType.Uint16));
    assertEq(uint8(Bytes.slice1(loadedSchema, 4)), uint8(SchemaType.Uint8));
    assertEq(uint8(Bytes.slice1(loadedSchema, 5)), uint8(SchemaType.Uint16));
  }

  function testSetAndGetData() public {
    // Register table's schema
    bytes32 schema = bytes32(
      bytes.concat(
        bytes2(uint16(6)),
        bytes1(uint8(SchemaType.Uint8)),
        bytes1(uint8(SchemaType.Uint16)),
        bytes1(uint8(SchemaType.Uint8)),
        bytes1(uint8(SchemaType.Uint16))
      )
    );

    bytes32 table = keccak256("some.table");
    StoreCore.registerSchema(table, schema);

    // Set data
    bytes memory data = bytes.concat(bytes1(0x01), bytes2(0x0203), bytes1(0x04), bytes2(0x0506));

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    uint256 gas = gasleft();
    StoreCore.set(table, key, data);
    gas = gas - gasleft();
    console.log("gas used (set): %s", gas);

    // Get data
    gas = gasleft();
    bytes memory loadedData = StoreCore.get(table, key, schema);
    gas = gas - gasleft();
    console.log("gas used (get, warm): %s", gas);

    assertTrue(Bytes.equals(data, loadedData));
  }

  function testFailSetAndGetData() public {
    // Register table's schema
    bytes32 schema = bytes32(
      bytes.concat(
        bytes2(uint16(6)),
        bytes1(uint8(SchemaType.Uint8)),
        bytes1(uint8(SchemaType.Uint16)),
        bytes1(uint8(SchemaType.Uint8)),
        bytes1(uint8(SchemaType.Uint16))
      )
    );

    bytes32 table = keccak256("some.table");
    StoreCore.registerSchema(table, schema);

    // Set data
    bytes memory data = bytes.concat(bytes1(0x01), bytes2(0x0203), bytes1(0x04));

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    uint256 gas = gasleft();
    StoreCore.set(table, key, data);
    gas = gas - gasleft();
    console.log("gas used (set): %s", gas);
  }

  function testSetAndGetDataSpanningWords() public {
    // Register table's schema
    SchemaType[] memory schemaTypes = new SchemaType[](2);
    schemaTypes[0] = SchemaType.Uint128;
    schemaTypes[1] = SchemaType.Uint256;

    bytes32 schema = StoreCore.encodeSchema(schemaTypes);

    bytes32 table = keccak256("some.table");
    StoreCore.registerSchema(table, schema);

    // Set data
    bytes memory data = bytes.concat(
      bytes16(0x0102030405060708090a0b0c0d0e0f10),
      bytes32(0x1112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30)
    );

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    uint256 gas = gasleft();
    StoreCore.set(table, key, data);
    gas = gas - gasleft();
    console.log("gas used (set): %s", gas);

    // Get data
    gas = gasleft();
    bytes memory loadedData = StoreCore.get(table, key, schema);
    gas = gas - gasleft();
    console.log("gas used (get, warm): %s", gas);

    assertTrue(Bytes.equals(data, loadedData));
  }

  function testSetFieldWithOffset() public {
    // Should not override the data before the offset
    // Should not override the data after the field
    // revert("todo");
  }
}
