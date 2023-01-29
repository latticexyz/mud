// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { StoreCore } from "../StoreCore.sol";
import { Utils } from "../Utils.sol";
import { Bytes } from "../Bytes.sol";
import { SchemaType } from "../Types.sol";
import { Storage } from "../Storage.sol";
import { Memory } from "../Memory.sol";
import { Cast } from "../Cast.sol";
import { Buffer, Buffer_ } from "../Buffer.sol";
import { Schema, Schema_ } from "../Schema.sol";
import { PackedCounter, PackedCounter_ } from "../PackedCounter.sol";

struct TestStruct {
  uint128 firstData;
  uint32[] secondData;
  uint32[] thirdData;
}

contract StoreCoreTest is DSTestPlus {
  TestStruct private testStruct;
  mapping(uint256 => bytes) private testMapping;

  function testRegisterAndGetSchema() public {
    Schema schema = Schema_.encode(SchemaType.Uint8, SchemaType.Uint16, SchemaType.Uint8, SchemaType.Uint16);

    bytes32 table = keccak256("some.table");
    uint256 gas = gasleft();
    StoreCore.registerSchema(table, schema);
    gas = gas - gasleft();
    console.log("gas used (register): %s", gas);

    gas = gasleft();
    Schema loadedSchema = StoreCore.getSchema(table);
    gas = gas - gasleft();
    console.log("gas used (get schema, warm): %s", gas);

    assertEq(schema.unwrap(), loadedSchema.unwrap());
  }

  function testFailRegisterInvalidSchema() public {
    StoreCore.registerSchema(keccak256("table"), Schema.wrap(keccak256("random bytes as schema")));
  }

  function testHasSchema() public {
    Schema schema = Schema_.encode(SchemaType.Uint8, SchemaType.Uint16, SchemaType.Uint8, SchemaType.Uint16);
    bytes32 table = keccak256("some.table");
    bytes32 table2 = keccak256("other.table");
    StoreCore.registerSchema(table, schema);

    uint256 gas = gasleft();
    StoreCore.hasTable(table);
    gas = gas - gasleft();
    console.log("gas used (has): %s", gas);

    gas = gasleft();
    StoreCore.hasTable(table2);
    gas = gas - gasleft();
    console.log("gas used (has not): %s", gas);

    assertTrue(StoreCore.hasTable(table));
    assertFalse(StoreCore.hasTable(table2));
  }

  function testSetAndGetDynamicDataLength() public {
    bytes32 table = keccak256("some.table");

    Schema schema = Schema_.encode(
      SchemaType.Uint8,
      SchemaType.Uint16,
      SchemaType.Uint32,
      SchemaType.Uint32Array,
      SchemaType.Uint32Array
    );

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

    PackedCounter encodedLength = StoreCore._loadEncodedDynamicDataLength(table, key);
    assertEq(encodedLength.atIndex(0), 10);
    assertEq(encodedLength.atIndex(1), 0);
    assertEq(encodedLength.total(), 10);

    // Set dynamic data length of dynamic index 1
    gas = gasleft();
    StoreCore._setDynamicDataLengthAtIndex(table, key, 1, 99);
    gas = gas - gasleft();
    console.log("gas used (set length): %s", gas);

    encodedLength = StoreCore._loadEncodedDynamicDataLength(table, key);
    assertEq(encodedLength.atIndex(0), 10);
    assertEq(encodedLength.atIndex(1), 99);
    assertEq(encodedLength.total(), 109);

    // Reduce dynamic data length of dynamic index 0 again
    gas = gasleft();
    StoreCore._setDynamicDataLengthAtIndex(table, key, 0, 5);
    gas = gas - gasleft();
    console.log("gas used (set length): %s", gas);

    encodedLength = StoreCore._loadEncodedDynamicDataLength(table, key);
    assertEq(encodedLength.atIndex(0), 5);
    assertEq(encodedLength.atIndex(1), 99);
    assertEq(encodedLength.total(), 104);
  }

  function testSetAndGetStaticData() public {
    // Register table's schema
    Schema schema = Schema_.encode(SchemaType.Uint8, SchemaType.Uint16, SchemaType.Uint8, SchemaType.Uint16);

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
    Schema schema = Schema_.encode(SchemaType.Uint8, SchemaType.Uint16, SchemaType.Uint8, SchemaType.Uint16);
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
    Schema schema = Schema_.encode(SchemaType.Uint128, SchemaType.Uint256);
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
      Schema schema = Schema_.encode(SchemaType.Uint128, SchemaType.Uint32Array, SchemaType.Uint32Array);
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

    PackedCounter encodedDynamicLength;
    {
      uint16[] memory dynamicLengths = new uint16[](2);
      dynamicLengths[0] = uint16(secondDataBytes.length);
      dynamicLengths[1] = uint16(thirdDataBytes.length);
      encodedDynamicLength = PackedCounter_.pack(dynamicLengths);
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
    console.log("gas used (store complex struct / StoreCore): %s", gas);

    // Get data
    gas = gasleft();
    bytes memory loadedData = StoreCore.get(table, key);
    gas = gas - gasleft();
    // console.log("gas used (read using StoreCore): %s", gas);

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
    console.log("gas used (store complex struct / Native): %s", gas);

    gas = gasleft();
    testMapping[1234] = abi.encode(_testStruct);
    gas = gas - gasleft();
    console.log("gas used (store complex struct / abi.encode): %s", gas);
  }

  function testSetAndGetField() public {
    bytes32 table = keccak256("some.table");

    {
      // Register table's schema
      Schema schema = Schema_.encode(
        SchemaType.Uint128,
        SchemaType.Uint256,
        SchemaType.Uint32Array,
        SchemaType.Uint32Array
      );
      StoreCore.registerSchema(table, schema);
    }

    bytes16 firstDataBytes = bytes16(0x0102030405060708090a0b0c0d0e0f10);

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    // Set first field
    uint256 gas = gasleft();
    StoreCore.setField(table, key, 0, bytes.concat(firstDataBytes));
    gas = gas - gasleft();
    console.log("gas used (set uint128, no offset): %s", gas);

    ////////////////
    // Static data
    ////////////////

    // Get first field
    gas = gasleft();
    bytes memory loadedData = StoreCore.getField(table, key, 0);
    gas = gas - gasleft();
    console.log("gas used (get uint128, no offset): %s", gas);

    // Verify loaded data is correct
    assertEq(loadedData.length, 16);
    assertEq(bytes16(loadedData), bytes16(firstDataBytes));

    // Verify the second index is not set yet
    assertEq(uint256(bytes32(StoreCore.getField(table, key, 1))), 0);

    // Set second field
    bytes32 secondDataBytes = keccak256("some data");

    gas = gasleft();
    StoreCore.setField(table, key, 1, bytes.concat(secondDataBytes));
    gas = gas - gasleft();
    console.log("gas used (set uint256, 128 offset): %s", gas);

    // Get second field
    gas = gasleft();
    loadedData = StoreCore.getField(table, key, 1);
    gas = gas - gasleft();
    console.log("gas used (get uint256, 128 offset): %s", gas);

    // Verify loaded data is correct
    assertEq(loadedData.length, 32);
    assertEq(bytes32(loadedData), secondDataBytes);

    // Verify the first field didn't change
    assertEq(bytes16(StoreCore.getField(table, key, 0)), bytes16(firstDataBytes));

    // Verify the full static data is correct
    assertEq(StoreCore.getStaticData(table, key).length, 48);
    assertEq(Bytes.slice16(StoreCore.getStaticData(table, key), 0), firstDataBytes);
    assertEq(Bytes.slice32(StoreCore.getStaticData(table, key), 16), secondDataBytes);
    assertEq(keccak256(StoreCore.getStaticData(table, key)), keccak256(bytes.concat(firstDataBytes, secondDataBytes)));

    ////////////////
    // Dynamic data
    ////////////////

    bytes memory thirdDataBytes;
    {
      uint32[] memory thirdData = new uint32[](2);
      thirdData[0] = 0x11121314;
      thirdData[1] = 0x15161718;
      thirdDataBytes = Bytes.from(thirdData);
    }

    bytes memory fourthDataBytes;
    {
      uint32[] memory fourthData = new uint32[](3);
      fourthData[0] = 0x191a1b1c;
      fourthData[1] = 0x1d1e1f20;
      fourthData[2] = 0x21222324;
      fourthDataBytes = Bytes.from(fourthData);
    }

    // Set third field
    gas = gasleft();
    StoreCore.setField(table, key, 2, thirdDataBytes);
    gas = gas - gasleft();
    console.log("gas used (set uint32[2]): %s", gas);

    // Get third field
    gas = gasleft();
    loadedData = StoreCore.getField(table, key, 2);
    gas = gas - gasleft();
    console.log("gas used (get uint32[2]): %s", gas);

    // Verify loaded data is correct
    assertEq(Cast.toUint32Array(Buffer_.fromBytes(loadedData).toArray(4)).length, 2);
    assertEq(loadedData.length, thirdDataBytes.length);
    assertEq(keccak256(loadedData), keccak256(thirdDataBytes));

    // Verify the fourth field is not set yet
    assertEq(StoreCore.getField(table, key, 3).length, 0);

    // Verify none of the previous fields were impacted
    assertEq(bytes16(StoreCore.getField(table, key, 0)), bytes16(firstDataBytes));
    assertEq(bytes32(StoreCore.getField(table, key, 1)), bytes32(secondDataBytes));

    // Set fourth field
    gas = gasleft();
    StoreCore.setField(table, key, 3, fourthDataBytes);
    gas = gas - gasleft();
    console.log("gas used (set uint32[3]): %s", gas);

    // Get fourth field
    gas = gasleft();
    loadedData = StoreCore.getField(table, key, 3);
    gas = gas - gasleft();
    console.log("gas used (get uint32[3]): %s", gas);

    // Verify loaded data is correct
    assertEq(loadedData.length, fourthDataBytes.length);
    assertEq(keccak256(loadedData), keccak256(fourthDataBytes));

    // Verify all fields are correct
    assertEq(
      keccak256(StoreCore.get(table, key)),
      keccak256(bytes.concat(firstDataBytes, secondDataBytes, thirdDataBytes, fourthDataBytes))
    );
  }
}
