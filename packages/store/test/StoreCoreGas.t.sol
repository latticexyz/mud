// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { StoreCore, StoreCoreInternal } from "../src/StoreCore.sol";
import { Bytes } from "../src/Bytes.sol";
import { SliceLib } from "../src/Slice.sol";
import { EncodeArray } from "../src/tightcoder/EncodeArray.sol";
import { Schema } from "../src/Schema.sol";
import { PackedCounter, PackedCounterLib } from "../src/PackedCounter.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { IStoreErrors } from "../src/IStoreErrors.sol";
import { IStore } from "../src/IStore.sol";
import { StoreHookLib } from "../src/StoreHook.sol";
import { SchemaEncodeHelper } from "./SchemaEncodeHelper.sol";
import { StoreMock } from "./StoreMock.sol";
import { MirrorSubscriber } from "./MirrorSubscriber.sol";

struct TestStruct {
  uint128 firstData;
  uint32[] secondData;
  uint32[] thirdData;
}

contract StoreCoreGasTest is Test, GasReporter, StoreMock {
  TestStruct private testStruct;

  mapping(uint256 => bytes) private testMapping;
  Schema defaultKeySchema = SchemaEncodeHelper.encode(SchemaType.BYTES32);

  function testRegisterAndGetSchema() public {
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );
    Schema keySchema = SchemaEncodeHelper.encode(SchemaType.UINT8, SchemaType.UINT16);
    bytes32 table = keccak256("some.table");

    string[] memory keyNames = new string[](2);
    keyNames[0] = "key1";
    keyNames[1] = "key2";
    string[] memory fieldNames = new string[](4);
    fieldNames[0] = "value1";
    fieldNames[1] = "value2";
    fieldNames[2] = "value3";
    fieldNames[3] = "value4";

    startGasReport("StoreCore: register schema");
    StoreCore.registerTable(table, keySchema, valueSchema, keyNames, fieldNames);
    endGasReport();

    startGasReport("StoreCore: get schema (warm)");
    StoreCore.getValueSchema(table);
    endGasReport();

    startGasReport("StoreCore: get key schema (warm)");
    StoreCore.getKeySchema(table);
    endGasReport();
  }

  function testHasSchema() public {
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );
    bytes32 table = keccak256("some.table");
    bytes32 table2 = keccak256("other.table");
    StoreCore.registerTable(table, defaultKeySchema, valueSchema, new string[](1), new string[](4));

    startGasReport("Check for existence of table (existent)");
    StoreCore.hasTable(table);
    endGasReport();

    startGasReport("check for existence of table (non-existent)");
    StoreCore.hasTable(table2);
    endGasReport();
  }

  function testSetAndGetDynamicDataLength() public {
    bytes32 table = keccak256("some.table");

    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT32,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT32_ARRAY
    );

    // Register schema
    StoreCore.registerTable(table, defaultKeySchema, valueSchema, new string[](1), new string[](5));

    // Create some key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some key");

    // Set dynamic data length of dynamic index 0
    startGasReport("set dynamic length of dynamic index 0");
    StoreCoreInternal._setDynamicDataLengthAtIndex(table, key, 0, 10);
    endGasReport();

    // Set dynamic data length of dynamic index 1
    startGasReport("set dynamic length of dynamic index 1");
    StoreCoreInternal._setDynamicDataLengthAtIndex(table, key, 1, 99);
    endGasReport();

    // Reduce dynamic data length of dynamic index 0 again
    startGasReport("reduce dynamic length of dynamic index 0");
    StoreCoreInternal._setDynamicDataLengthAtIndex(table, key, 0, 5);
    endGasReport();
  }

  function testSetAndGetStaticData() public {
    // Register table's schema
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );
    bytes32 table = keccak256("some.table");
    StoreCore.registerTable(table, defaultKeySchema, valueSchema, new string[](1), new string[](4));

    // Set data
    bytes memory staticData = abi.encodePacked(bytes1(0x01), bytes2(0x0203), bytes1(0x04), bytes2(0x0506));
    bytes memory dynamicData = new bytes(0);
    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    startGasReport("set static record (1 slot)");
    StoreCore.setRecord(table, key, staticData, PackedCounter.wrap(bytes32(0)), dynamicData, valueSchema);
    endGasReport();

    // Get data
    startGasReport("get static record (1 slot)");
    StoreCore.getRecord(table, key, valueSchema);
    endGasReport();
  }

  function testSetAndGetStaticDataSpanningWords() public {
    // Register table's schema
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT128, SchemaType.UINT256);
    bytes32 table = keccak256("some.table");
    StoreCore.registerTable(table, defaultKeySchema, valueSchema, new string[](1), new string[](2));

    // Set data
    bytes memory staticData = abi.encodePacked(
      bytes16(0x0102030405060708090a0b0c0d0e0f10),
      bytes32(0x1112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30)
    );
    bytes memory dynamicData = new bytes(0);

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    startGasReport("set static record (2 slots)");
    StoreCore.setRecord(table, key, staticData, PackedCounter.wrap(bytes32(0)), dynamicData, valueSchema);
    endGasReport();

    // Get data
    startGasReport("get static record (2 slots)");
    StoreCore.getRecord(table, key, valueSchema);
    endGasReport();
  }

  function testSetAndGetDynamicData() public {
    bytes32 table = keccak256("some.table");

    // Register table's schema
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT128,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT32_ARRAY
    );
    StoreCore.registerTable(table, defaultKeySchema, valueSchema, new string[](1), new string[](3));

    bytes16 firstDataBytes = bytes16(0x0102030405060708090a0b0c0d0e0f10);

    bytes memory secondDataBytes;
    {
      uint32[] memory secondData = new uint32[](2);
      secondData[0] = 0x11121314;
      secondData[1] = 0x15161718;
      secondDataBytes = EncodeArray.encode(secondData);
    }

    bytes memory thirdDataBytes;
    {
      uint32[] memory thirdData = new uint32[](3);
      thirdData[0] = 0x191a1b1c;
      thirdData[1] = 0x1d1e1f20;
      thirdData[2] = 0x21222324;
      thirdDataBytes = EncodeArray.encode(thirdData);
    }

    PackedCounter encodedDynamicLength = PackedCounterLib.pack(
      uint40(secondDataBytes.length),
      uint40(thirdDataBytes.length)
    );

    // Concat data
    bytes memory staticData = abi.encodePacked(firstDataBytes);
    bytes memory dynamicData = abi.encodePacked(secondDataBytes, thirdDataBytes);

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    // Set data
    startGasReport("set complex record with dynamic data (4 slots)");
    StoreCore.setRecord(table, key, staticData, encodedDynamicLength, dynamicData, valueSchema);
    endGasReport();

    // Get data
    startGasReport("get complex record with dynamic data (4 slots)");
    StoreCore.getRecord(table, key, valueSchema);
    endGasReport();

    // Compare gas - setting the data as raw struct
    TestStruct memory _testStruct = TestStruct(0, new uint32[](2), new uint32[](3));
    _testStruct.firstData = 0x0102030405060708090a0b0c0d0e0f10;
    _testStruct.secondData[0] = 0x11121314;
    _testStruct.secondData[1] = 0x15161718;
    _testStruct.thirdData[0] = 0x191a1b1c;
    _testStruct.thirdData[1] = 0x1d1e1f20;
    _testStruct.thirdData[2] = 0x21222324;

    startGasReport("compare: Set complex record with dynamic data using native solidity");
    testStruct = _testStruct;
    endGasReport();

    startGasReport("compare: Set complex record with dynamic data using abi.encode");
    testMapping[1234] = abi.encode(_testStruct);
    endGasReport();
  }

  function testSetAndGetField() public {
    bytes32 table = keccak256("some.table");

    // Register table's schema
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT128,
      SchemaType.UINT256,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT32_ARRAY
    );
    StoreCore.registerTable(table, defaultKeySchema, valueSchema, new string[](1), new string[](4));

    bytes16 firstDataBytes = bytes16(0x0102030405060708090a0b0c0d0e0f10);

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    bytes memory firstDataPacked = abi.encodePacked(firstDataBytes);

    // Set first field
    startGasReport("set static field (1 slot)");
    StoreCore.setField(table, key, 0, firstDataPacked, valueSchema);
    endGasReport();

    ////////////////
    // Static data
    ////////////////

    // Get first field
    startGasReport("get static field (1 slot)");
    StoreCore.getField(table, key, 0, valueSchema);
    endGasReport();

    // Set second field
    bytes32 secondDataBytes = keccak256("some data");
    bytes memory secondDataPacked = abi.encodePacked(secondDataBytes);

    startGasReport("set static field (overlap 2 slot)");
    StoreCore.setField(table, key, 1, secondDataPacked, valueSchema);
    endGasReport();

    // Get second field
    startGasReport("get static field (overlap 2 slot)");
    StoreCore.getField(table, key, 1, valueSchema);
    endGasReport();

    ////////////////
    // Dynamic data
    ////////////////

    bytes memory thirdDataBytes;
    {
      uint32[] memory thirdData = new uint32[](2);
      thirdData[0] = 0x11121314;
      thirdData[1] = 0x15161718;
      thirdDataBytes = EncodeArray.encode(thirdData);
    }

    bytes memory fourthDataBytes;
    {
      uint32[] memory fourthData = new uint32[](3);
      fourthData[0] = 0x191a1b1c;
      fourthData[1] = 0x1d1e1f20;
      fourthData[2] = 0x21222324;
      fourthDataBytes = EncodeArray.encode(fourthData);
    }

    // Set third field
    startGasReport("set dynamic field (1 slot, first dynamic field)");
    StoreCore.setField(table, key, 2, thirdDataBytes, valueSchema);
    endGasReport();

    // Get third field
    startGasReport("get dynamic field (1 slot, first dynamic field)");
    StoreCore.getField(table, key, 2, valueSchema);
    endGasReport();

    // Set fourth field
    startGasReport("set dynamic field (1 slot, second dynamic field)");
    StoreCore.setField(table, key, 3, fourthDataBytes, valueSchema);
    endGasReport();

    // Get fourth field
    startGasReport("get dynamic field (1 slot, second dynamic field)");
    StoreCore.getField(table, key, 3, valueSchema);
    endGasReport();
  }

  function testDeleteData() public {
    bytes32 table = keccak256("some.table");

    // Register table's schema
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT128,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT32_ARRAY
    );
    StoreCore.registerTable(table, defaultKeySchema, valueSchema, new string[](1), new string[](3));

    bytes16 firstDataBytes = bytes16(0x0102030405060708090a0b0c0d0e0f10);

    bytes memory secondDataBytes;
    {
      uint32[] memory secondData = new uint32[](2);
      secondData[0] = 0x11121314;
      secondData[1] = 0x15161718;
      secondDataBytes = EncodeArray.encode(secondData);
    }

    bytes memory thirdDataBytes;
    {
      uint32[] memory thirdData = new uint32[](3);
      thirdData[0] = 0x191a1b1c;
      thirdData[1] = 0x1d1e1f20;
      thirdData[2] = 0x21222324;
      thirdDataBytes = EncodeArray.encode(thirdData);
    }

    PackedCounter encodedDynamicLength = PackedCounterLib.pack(
      uint40(secondDataBytes.length),
      uint40(thirdDataBytes.length)
    );

    // Concat data
    bytes memory staticData = abi.encodePacked(firstDataBytes);
    bytes memory dynamicData = abi.encodePacked(secondDataBytes, thirdDataBytes);

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    // Set data
    StoreCore.setRecord(table, key, staticData, encodedDynamicLength, dynamicData, valueSchema);

    // Delete data
    startGasReport("delete record (complex data, 3 slots)");
    StoreCore.deleteRecord(table, key, valueSchema);
    endGasReport();
  }

  function testPushToField() public {
    bytes32 table = keccak256("some.table");

    // Register table's schema
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT256,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT32_ARRAY
    );
    StoreCore.registerTable(table, defaultKeySchema, valueSchema, new string[](1), new string[](3));

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    // Create data
    bytes32 firstDataBytes = keccak256("some data");
    bytes memory secondDataBytes;
    {
      uint32[] memory secondData = new uint32[](2);
      secondData[0] = 0x11121314;
      secondData[1] = 0x15161718;
      secondDataBytes = EncodeArray.encode(secondData);
    }
    bytes memory thirdDataBytes;
    {
      uint32[] memory thirdData = new uint32[](3);
      thirdData[0] = 0x191a1b1c;
      thirdData[1] = 0x1d1e1f20;
      thirdData[2] = 0x21222324;
      thirdDataBytes = EncodeArray.encode(thirdData);
    }

    // Set fields
    StoreCore.setField(table, key, 0, abi.encodePacked(firstDataBytes), valueSchema);
    StoreCore.setField(table, key, 1, secondDataBytes, valueSchema);
    // Initialize a field with push
    StoreCore.pushToField(table, key, 2, thirdDataBytes, valueSchema);

    // Create data to push
    bytes memory secondDataToPush;
    {
      uint32[] memory secondData = new uint32[](1);
      secondData[0] = 0x25262728;
      secondDataToPush = EncodeArray.encode(secondData);
    }

    // Push to second field
    startGasReport("push to field (1 slot, 1 uint32 item)");
    StoreCore.pushToField(table, key, 1, secondDataToPush, valueSchema);
    endGasReport();

    // Create data to push
    bytes memory thirdDataToPush;
    {
      uint32[] memory thirdData = new uint32[](10);
      thirdData[0] = 0x12345678;
      thirdData[1] = 0x9abcdef0;
      thirdData[2] = 0x12345678;
      thirdData[3] = 0x9abcdef0;
      thirdData[4] = 0x12345678;
      thirdData[5] = 0x9abcdef0;
      thirdData[6] = 0x12345678;
      thirdData[7] = 0x9abcdef0;
      thirdData[8] = 0x12345678;
      thirdData[9] = 0x9abcdef0;
      thirdDataToPush = EncodeArray.encode(thirdData);
    }

    // Push to third field
    startGasReport("push to field (2 slots, 10 uint32 items)");
    StoreCore.pushToField(table, key, 2, thirdDataToPush, valueSchema);
    endGasReport();
  }

  struct TestUpdateInFieldData {
    bytes32 firstDataBytes;
    bytes secondDataBytes;
    bytes secondDataForUpdate;
    bytes newSecondDataBytes;
    bytes thirdDataBytes;
    bytes thirdDataForUpdate;
    bytes newThirdDataBytes;
  }

  function testUpdateInField() public {
    TestUpdateInFieldData memory data = TestUpdateInFieldData("", "", "", "", "", "", "");
    bytes32 table = keccak256("some.table");

    // Register table's schema
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT256,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT64_ARRAY
    );
    StoreCore.registerTable(table, defaultKeySchema, valueSchema, new string[](1), new string[](3));

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    // Create data
    data.firstDataBytes = keccak256("some data");
    uint32[] memory secondData = new uint32[](2);
    secondData[0] = 0x11121314;
    secondData[1] = 0x15161718;
    data.secondDataBytes = EncodeArray.encode(secondData);

    uint64[] memory thirdData = new uint64[](6);
    thirdData[0] = 0x1111111111111111;
    thirdData[1] = 0x2222222222222222;
    thirdData[2] = 0x3333333333333333;
    thirdData[3] = 0x4444444444444444;
    thirdData[4] = 0x5555555555555555;
    thirdData[5] = 0x6666666666666666;
    data.thirdDataBytes = EncodeArray.encode(thirdData);

    // Set fields
    StoreCore.setField(table, key, 0, abi.encodePacked(data.firstDataBytes), valueSchema);
    StoreCore.setField(table, key, 1, data.secondDataBytes, valueSchema);
    StoreCore.setField(table, key, 2, data.thirdDataBytes, valueSchema);

    // Create data to use for the update
    {
      uint32[] memory _secondDataForUpdate = new uint32[](1);
      _secondDataForUpdate[0] = 0x25262728;
      data.secondDataForUpdate = EncodeArray.encode(_secondDataForUpdate);

      data.newSecondDataBytes = abi.encodePacked(secondData[0], _secondDataForUpdate[0]);
    }

    // Update index 1 in second field (4 = byte length of uint32)
    startGasReport("update in field (1 slot, 1 uint32 item)");
    StoreCore.updateInField(table, key, 1, 4 * 1, data.secondDataForUpdate, valueSchema);
    endGasReport();

    // Create data for update
    {
      uint64[] memory _thirdDataForUpdate = new uint64[](4);
      _thirdDataForUpdate[0] = 0x7777777777777777;
      _thirdDataForUpdate[1] = 0x8888888888888888;
      _thirdDataForUpdate[2] = 0x9999999999999999;
      _thirdDataForUpdate[3] = 0x0;
      data.thirdDataForUpdate = EncodeArray.encode(_thirdDataForUpdate);

      data.newThirdDataBytes = abi.encodePacked(
        thirdData[0],
        _thirdDataForUpdate[0],
        _thirdDataForUpdate[1],
        _thirdDataForUpdate[2],
        _thirdDataForUpdate[3],
        thirdData[5]
      );
    }

    // Update indexes 1,2,3,4 in third field (8 = byte length of uint64)
    startGasReport("push to field (2 slots, 6 uint64 items)");
    StoreCore.updateInField(table, key, 2, 8 * 1, data.thirdDataForUpdate, valueSchema);
    endGasReport();
  }

  function testAccessEmptyData() public {
    bytes32 table = keccak256("some.table");
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT32, SchemaType.UINT32_ARRAY);

    StoreCore.registerTable(table, defaultKeySchema, valueSchema, new string[](1), new string[](2));

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    startGasReport("access non-existing record");
    StoreCore.getRecord(table, key, valueSchema);
    endGasReport();

    startGasReport("access static field of non-existing record");
    StoreCore.getField(table, key, 0, valueSchema);
    endGasReport();

    startGasReport("access dynamic field of non-existing record");
    StoreCore.getField(table, key, 1, valueSchema);
    endGasReport();

    startGasReport("access length of dynamic field of non-existing record");
    StoreCore.getFieldLength(table, key, 1, valueSchema);
    endGasReport();

    startGasReport("access slice of dynamic field of non-existing record");
    StoreCore.getFieldSlice(table, key, 1, valueSchema, 0, 0);
    endGasReport();
  }

  function testHooks() public {
    bytes32 table = keccak256("some.table");
    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some key");

    // Register table's schema
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT128);
    StoreCore.registerTable(table, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Create subscriber
    MirrorSubscriber subscriber = new MirrorSubscriber(
      table,
      defaultKeySchema,
      valueSchema,
      new string[](1),
      new string[](1)
    );

    startGasReport("register subscriber");
    StoreCore.registerStoreHook(
      table,
      subscriber,
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: true,
        onAfterSetRecord: false,
        onBeforeSetField: true,
        onAfterSetField: false,
        onBeforeDeleteRecord: true,
        onAfterDeleteRecord: false
      })
    );
    endGasReport();

    bytes memory staticData = abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10));
    bytes memory dynamicData = new bytes(0);

    startGasReport("set record on table with subscriber");
    StoreCore.setRecord(table, key, staticData, PackedCounter.wrap(bytes32(0)), dynamicData, valueSchema);
    endGasReport();

    staticData = abi.encodePacked(bytes16(0x1112131415161718191a1b1c1d1e1f20));

    startGasReport("set static field on table with subscriber");
    StoreCore.setField(table, key, 0, staticData, valueSchema);
    endGasReport();

    startGasReport("delete record on table with subscriber");
    StoreCore.deleteRecord(table, key, valueSchema);
    endGasReport();
  }

  function testHooksDynamicData() public {
    bytes32 table = keccak256("some.table");
    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some key");

    // Register table's schema
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT128, SchemaType.UINT32_ARRAY);
    StoreCore.registerTable(table, defaultKeySchema, valueSchema, new string[](1), new string[](2));

    // Create subscriber
    MirrorSubscriber subscriber = new MirrorSubscriber(
      table,
      defaultKeySchema,
      valueSchema,
      new string[](1),
      new string[](2)
    );

    startGasReport("register subscriber");
    StoreCore.registerStoreHook(
      table,
      subscriber,
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: true,
        onAfterSetRecord: false,
        onBeforeSetField: true,
        onAfterSetField: false,
        onBeforeDeleteRecord: true,
        onAfterDeleteRecord: false
      })
    );
    endGasReport();

    uint32[] memory arrayData = new uint32[](1);
    arrayData[0] = 0x01020304;
    bytes memory arrayDataBytes = EncodeArray.encode(arrayData);
    PackedCounter encodedArrayDataLength = PackedCounterLib.pack(uint40(arrayDataBytes.length));
    bytes memory dynamicData = arrayDataBytes;
    bytes memory staticData = abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10));
    bytes memory data = abi.encodePacked(staticData, encodedArrayDataLength, dynamicData);

    startGasReport("set (dynamic) record on table with subscriber");
    StoreCore.setRecord(table, key, staticData, encodedArrayDataLength, dynamicData, valueSchema);
    endGasReport();

    // Update dynamic data
    arrayData[0] = 0x11121314;
    arrayDataBytes = EncodeArray.encode(arrayData);
    dynamicData = arrayDataBytes;
    data = abi.encodePacked(staticData, encodedArrayDataLength, dynamicData);

    startGasReport("set (dynamic) field on table with subscriber");
    StoreCore.setField(table, key, 1, arrayDataBytes, valueSchema);
    endGasReport();

    startGasReport("delete (dynamic) record on table with subscriber");
    StoreCore.deleteRecord(table, key, valueSchema);
    endGasReport();
  }
}
