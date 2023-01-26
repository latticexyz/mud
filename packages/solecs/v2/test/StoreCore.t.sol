// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { StoreCore } from "../StoreCore.sol";
import { Utils } from "../Utils.sol";
import { Bytes } from "../Bytes.sol";
import { SchemaType } from "../Types.sol";

contract StoreCoreTest is DSTestPlus {
  TestStruct testStruct;

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

  function testEncodeAndDecodeDynamicLength() public {
    uint16[] memory lengths = new uint16[](4);
    lengths[0] = 1;
    lengths[1] = 2;
    lengths[2] = 3;
    lengths[3] = 4;

    uint256 gas = gasleft();
    bytes32 encodedLengths = StoreCore.encodeDynamicDataLength(lengths);
    gas = gas - gasleft();
    console.log("gas used (encode): %s", gas);

    gas = gasleft();
    StoreCore._decodeDynamicDataLengthAtIndex(encodedLengths, 3);
    gas = gas - gasleft();
    console.log("gas used (decode index): %s", gas);

    gas = gasleft();
    StoreCore._decodeDynamicDataTotalLength(encodedLengths);
    gas = gas - gasleft();
    console.log("gas used (decode total): %s", gas);

    assertEq(StoreCore._decodeDynamicDataLengthAtIndex(encodedLengths, 0), 1);
    assertEq(StoreCore._decodeDynamicDataLengthAtIndex(encodedLengths, 1), 2);
    assertEq(StoreCore._decodeDynamicDataLengthAtIndex(encodedLengths, 2), 3);
    assertEq(StoreCore._decodeDynamicDataLengthAtIndex(encodedLengths, 3), 4);
    assertEq(StoreCore._decodeDynamicDataTotalLength(encodedLengths), 10);
  }

  function testSetAndGetDynamicDataLength() public {
    bytes32 table = keccak256("some.table");

    SchemaType[] memory _schema = new SchemaType[](6);
    _schema[0] = SchemaType.Uint8; // 1 byte
    _schema[1] = SchemaType.Uint16; // 2 bytes
    _schema[2] = SchemaType.Uint32; // 4 bytes
    _schema[3] = SchemaType.Uint32Array; // 0 bytes (because it's dynamic)
    _schema[4] = SchemaType.Uint32Array; // 0 bytes (because it's dynamic)

    bytes32 schema = StoreCore.encodeSchema(_schema);

    // Register schema
    StoreCore.registerSchema(table, schema);

    // Create some key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some key");

    // Set dynamic data length of dynamic index 0
    uint256 gas = gasleft();
    StoreCore._setDynamicDataLengthAtIndex(table, key, 0, 10);
    gas = gas - gasleft();
    console.log("gas used (set length): %s", gas);

    assertEq(StoreCore._getDynamicDataLengthAtIndex(table, key, 0), 10);
    assertEq(StoreCore._getDynamicDataLengthAtIndex(table, key, 1), 0);
    assertEq(StoreCore._getDynamicDataTotalLength(table, key), 10);

    // Set dynamic data length of dynamic index 1
    gas = gasleft();
    StoreCore._setDynamicDataLengthAtIndex(table, key, 1, 99);
    gas = gas - gasleft();
    console.log("gas used (set length): %s", gas);

    assertEq(StoreCore._getDynamicDataLengthAtIndex(table, key, 0), 10);
    assertEq(StoreCore._getDynamicDataLengthAtIndex(table, key, 1), 99);
    assertEq(StoreCore._getDynamicDataTotalLength(table, key), 109);

    // Reduce dynamic data length of dynamic index 0 again
    gas = gasleft();
    StoreCore._setDynamicDataLengthAtIndex(table, key, 0, 5);
    gas = gas - gasleft();
    console.log("gas used (set length): %s", gas);

    assertEq(StoreCore._getDynamicDataLengthAtIndex(table, key, 0), 5);
    assertEq(StoreCore._getDynamicDataLengthAtIndex(table, key, 1), 99);
    assertEq(StoreCore._getDynamicDataTotalLength(table, key), 104);

    gas = gasleft();
    StoreCore._getDynamicDataLengthAtIndex(table, key, 0);
    gas = gas - gasleft();
    console.log("gas used (get length at index): %s", gas);
  }

  function testSetAndGetStaticData() public {
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
    StoreCore.setStaticData(table, key, data);
    gas = gas - gasleft();
    console.log("gas used (set): %s", gas);

    // Get data
    gas = gasleft();
    bytes memory loadedData = StoreCore.get(table, key, schema);
    gas = gas - gasleft();
    console.log("gas used (get, warm): %s", gas);

    assertTrue(Bytes.equals(data, loadedData));
  }

  function testFailSetAndGetStaticData() public {
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
    // This should fail because the data is not 6 bytes long
    StoreCore.setStaticData(table, key, data);
    gas = gas - gasleft();
    console.log("gas used (set): %s", gas);
  }

  function testSetAndGetStaticDataSpanningWords() public {
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
    StoreCore.setStaticData(table, key, data);
    gas = gas - gasleft();
    console.log("gas used (set): %s", gas);

    // Get data
    gas = gasleft();
    bytes memory loadedData = StoreCore.get(table, key, schema);
    gas = gas - gasleft();
    console.log("gas used (get, warm): %s", gas);

    assertTrue(Bytes.equals(data, loadedData));
  }

  function testSetAndGetDynamicData() public {
    bytes32 table = keccak256("some.table");

    {
      // Register table's schema
      SchemaType[] memory schemaTypes = new SchemaType[](3);
      schemaTypes[0] = SchemaType.Uint128;
      schemaTypes[1] = SchemaType.Uint32Array;
      schemaTypes[2] = SchemaType.Uint32Array;
      bytes32 schema = StoreCore.encodeSchema(schemaTypes);
      StoreCore.registerSchema(table, schema);
    }

    bytes16 firstDataBytes = bytes16(0x0102030405060708090a0b0c0d0e0f10);

    bytes memory secondDataBytes;
    {
      uint32[] memory secondData = new uint32[](2);
      secondData[0] = 0x11121314;
      secondData[1] = 0x15161718;
      secondDataBytes = Bytes.from(secondData);
    }

    bytes memory thirdDataBytes;
    {
      uint32[] memory thirdData = new uint32[](3);
      thirdData[0] = 0x191a1b1c;
      thirdData[1] = 0x1d1e1f20;
      thirdData[2] = 0x21222324;
      thirdDataBytes = Bytes.from(thirdData);
    }

    bytes32 encodedDynamicLength;
    {
      uint16[] memory dynamicLengths = new uint16[](2);
      dynamicLengths[0] = uint16(secondDataBytes.length);
      dynamicLengths[1] = uint16(thirdDataBytes.length);
      encodedDynamicLength = StoreCore.encodeDynamicDataLength(dynamicLengths);
    }

    // Concat data
    bytes memory data = bytes.concat(firstDataBytes, secondDataBytes, thirdDataBytes);

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    // Set data
    uint256 gas = gasleft();
    StoreCore.set(table, key, encodedDynamicLength, data);
    gas = gas - gasleft();
    console.log("gas used (set, %s bytes, 1 static field, 2 dynamic fields): %s", data.length, gas);

    // Get data
    gas = gasleft();
    bytes memory loadedData = StoreCore.get(table, key);
    gas = gas - gasleft();
    console.log("gas used (get, warm, %s bytes): %s", loadedData.length, gas);

    assertEq(loadedData.length, data.length);
    assertEq(keccak256(loadedData), keccak256(data));

    // Compare gas - setting the data as raw struct
    TestStruct memory _testStruct = TestStruct(0, new uint32[](2), new uint32[](3));
    _testStruct.firstData = 0x0102030405060708090a0b0c0d0e0f10;
    _testStruct.secondData[0] = 0x11121314;
    _testStruct.secondData[1] = 0x15161718;
    _testStruct.thirdData[0] = 0x191a1b1c;
    _testStruct.thirdData[1] = 0x1d1e1f20;
    _testStruct.thirdData[2] = 0x21222324;

    gas = gasleft();
    testStruct = _testStruct;
    gas = gas - gasleft();
    console.log("gas used (store native struct): %s", gas);
  }
}

struct TestStruct {
  uint128 firstData;
  uint32[] secondData;
  uint32[] thirdData;
}
