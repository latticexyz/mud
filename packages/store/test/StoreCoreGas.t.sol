// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { StoreCore, StoreCoreInternal } from "../src/StoreCore.sol";
import { Utils } from "../src/Utils.sol";
import { Bytes } from "../src/Bytes.sol";
import { SliceLib } from "../src/Slice.sol";
import { EncodeArray } from "../src/tightcoder/EncodeArray.sol";
import { Schema, SchemaLib } from "../src/Schema.sol";
import { PackedCounter, PackedCounterLib } from "../src/PackedCounter.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { IStoreErrors } from "../src/IStoreErrors.sol";
import { IStore, IStoreHook } from "../src/IStore.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";
import { StoreMetadataData, StoreMetadata } from "../src/codegen/Tables.sol";
import { StoreMock } from "./StoreMock.sol";

struct TestStruct {
  uint128 firstData;
  uint32[] secondData;
  uint32[] thirdData;
}

contract StoreCoreGasTest is Test, StoreMock {
  TestStruct private testStruct;

  mapping(uint256 => bytes) private testMapping;
  Schema defaultKeySchema = SchemaLib.encode(SchemaType.BYTES32);

  function testRegisterAndGetSchema() public {
    Schema schema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);
    Schema keySchema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT16);
    bytes32 table = keccak256("some.table");

    // !gasreport StoreCore: register schema
    StoreCore.registerSchema(table, schema, keySchema);

    // !gasreport StoreCore: get schema (warm)
    StoreCore.getSchema(table);

    // !gasreport StoreCore: get key schema (warm)
    StoreCore.getKeySchema(table);
  }

  function testHasSchema() public {
    Schema schema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);
    bytes32 table = keccak256("some.table");
    bytes32 table2 = keccak256("other.table");
    StoreCore.registerSchema(table, schema, defaultKeySchema);

    // !gasreport Check for existence of table (existent)
    StoreCore.hasTable(table);

    // !gasreport check for existence of table (non-existent)
    StoreCore.hasTable(table2);
  }

  function testSetMetadata() public {
    bytes32 table = keccak256("some.table");
    Schema schema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT16);
    Schema keySchema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);
    string memory tableName = "someTable";
    string[] memory fieldNames = new string[](2);
    fieldNames[0] = "field1";
    fieldNames[1] = "field2";

    // Register table
    StoreCore.registerSchema(table, schema, keySchema);

    // !gasreport StoreCore: set table metadata
    StoreCore.setMetadata(table, tableName, fieldNames);
  }

  function testSetAndGetDynamicDataLength() public {
    bytes32 table = keccak256("some.table");

    Schema schema = SchemaLib.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT32,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT32_ARRAY
    );

    // Register schema
    StoreCore.registerSchema(table, schema, defaultKeySchema);

    // Create some key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some key");

    // Set dynamic data length of dynamic index 0
    // !gasreport set dynamic length of dynamic index 0
    StoreCoreInternal._setDynamicDataLengthAtIndex(table, key, 0, 10);

    // Set dynamic data length of dynamic index 1
    // !gasreport set dynamic length of dynamic index 1
    StoreCoreInternal._setDynamicDataLengthAtIndex(table, key, 1, 99);

    // Reduce dynamic data length of dynamic index 0 again
    // !gasreport reduce dynamic length of dynamic index 0
    StoreCoreInternal._setDynamicDataLengthAtIndex(table, key, 0, 5);
  }

  function testSetAndGetStaticData() public {
    // Register table's schema
    Schema schema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);
    bytes32 table = keccak256("some.table");
    StoreCore.registerSchema(table, schema, defaultKeySchema);

    // Set data
    bytes memory data = abi.encodePacked(bytes1(0x01), bytes2(0x0203), bytes1(0x04), bytes2(0x0506));
    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    // !gasreport set static record (1 slot)
    StoreCore.setRecord(table, key, data);

    // Get data
    // !gasreport get static record (1 slot)
    StoreCore.getRecord(table, key, schema);
  }

  function testSetAndGetStaticDataSpanningWords() public {
    // Register table's schema
    Schema schema = SchemaLib.encode(SchemaType.UINT128, SchemaType.UINT256);
    bytes32 table = keccak256("some.table");
    StoreCore.registerSchema(table, schema, defaultKeySchema);

    // Set data
    bytes memory data = abi.encodePacked(
      bytes16(0x0102030405060708090a0b0c0d0e0f10),
      bytes32(0x1112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30)
    );

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    // !gasreport set static record (2 slots)
    StoreCore.setRecord(table, key, data);

    // Get data
    // !gasreport get static record (2 slots)
    StoreCore.getRecord(table, key, schema);
  }

  function testSetAndGetDynamicData() public {
    bytes32 table = keccak256("some.table");

    {
      // Register table's schema
      Schema schema = SchemaLib.encode(SchemaType.UINT128, SchemaType.UINT32_ARRAY, SchemaType.UINT32_ARRAY);
      StoreCore.registerSchema(table, schema, defaultKeySchema);
    }

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

    PackedCounter encodedDynamicLength;
    {
      uint40[] memory dynamicLengths = new uint40[](2);
      dynamicLengths[0] = uint40(secondDataBytes.length);
      dynamicLengths[1] = uint40(thirdDataBytes.length);
      encodedDynamicLength = PackedCounterLib.pack(dynamicLengths);
    }

    // Concat data
    bytes memory data = abi.encodePacked(
      firstDataBytes,
      encodedDynamicLength.unwrap(),
      secondDataBytes,
      thirdDataBytes
    );

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    // Set data
    // !gasreport set complex record with dynamic data (4 slots)
    StoreCore.setRecord(table, key, data);

    // Get data
    // !gasreport get complex record with dynamic data (4 slots)
    StoreCore.getRecord(table, key);

    // Compare gas - setting the data as raw struct
    TestStruct memory _testStruct = TestStruct(0, new uint32[](2), new uint32[](3));
    _testStruct.firstData = 0x0102030405060708090a0b0c0d0e0f10;
    _testStruct.secondData[0] = 0x11121314;
    _testStruct.secondData[1] = 0x15161718;
    _testStruct.thirdData[0] = 0x191a1b1c;
    _testStruct.thirdData[1] = 0x1d1e1f20;
    _testStruct.thirdData[2] = 0x21222324;

    // !gasreport compare: Set complex record with dynamic data using native solidity
    testStruct = _testStruct;

    // !gasreport compare: Set complex record with dynamic data using abi.encode
    testMapping[1234] = abi.encode(_testStruct);
  }

  function testSetAndGetField() public {
    bytes32 table = keccak256("some.table");

    {
      // Register table's schema
      Schema schema = SchemaLib.encode(
        SchemaType.UINT128,
        SchemaType.UINT256,
        SchemaType.UINT32_ARRAY,
        SchemaType.UINT32_ARRAY
      );
      StoreCore.registerSchema(table, schema, defaultKeySchema);
    }

    bytes16 firstDataBytes = bytes16(0x0102030405060708090a0b0c0d0e0f10);

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    bytes memory firstDataPacked = abi.encodePacked(firstDataBytes);

    // Set first field
    // !gasreport set static field (1 slot)
    StoreCore.setField(table, key, 0, firstDataPacked);

    ////////////////
    // Static data
    ////////////////

    // Get first field
    // !gasreport get static field (1 slot)
    StoreCore.getField(table, key, 0);

    // Set second field
    bytes32 secondDataBytes = keccak256("some data");
    bytes memory secondDataPacked = abi.encodePacked(secondDataBytes);

    // !gasreport set static field (overlap 2 slot)
    StoreCore.setField(table, key, 1, secondDataPacked);

    // Get second field
    // !gasreport get static field (overlap 2 slot)
    StoreCore.getField(table, key, 1);

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
    // !gasreport set dynamic field (1 slot, first dynamic field)
    StoreCore.setField(table, key, 2, thirdDataBytes);

    // Get third field
    // !gasreport get dynamic field (1 slot, first dynamic field)
    StoreCore.getField(table, key, 2);

    // Set fourth field
    // !gasreport set dynamic field (1 slot, second dynamic field)
    StoreCore.setField(table, key, 3, fourthDataBytes);

    // Get fourth field
    // !gasreport get dynamic field (1 slot, second dynamic field)
    StoreCore.getField(table, key, 3);
  }

  function testDeleteData() public {
    bytes32 table = keccak256("some.table");

    // Register table's schema
    Schema schema = SchemaLib.encode(SchemaType.UINT128, SchemaType.UINT32_ARRAY, SchemaType.UINT32_ARRAY);
    StoreCore.registerSchema(table, schema, defaultKeySchema);

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

    PackedCounter encodedDynamicLength;
    {
      uint40[] memory dynamicLengths = new uint40[](2);
      dynamicLengths[0] = uint40(secondDataBytes.length);
      dynamicLengths[1] = uint40(thirdDataBytes.length);
      encodedDynamicLength = PackedCounterLib.pack(dynamicLengths);
    }

    // Concat data
    bytes memory data = abi.encodePacked(
      firstDataBytes,
      encodedDynamicLength.unwrap(),
      secondDataBytes,
      thirdDataBytes
    );

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    // Set data
    StoreCore.setRecord(table, key, data);

    // Delete data
    // !gasreport delete record (complex data, 3 slots)
    StoreCore.deleteRecord(table, key);
  }

  function testPushToField() public {
    bytes32 table = keccak256("some.table");

    {
      // Register table's schema
      Schema schema = SchemaLib.encode(SchemaType.UINT256, SchemaType.UINT32_ARRAY, SchemaType.UINT32_ARRAY);
      StoreCore.registerSchema(table, schema, defaultKeySchema);
    }

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
    StoreCore.setField(table, key, 0, abi.encodePacked(firstDataBytes));
    StoreCore.setField(table, key, 1, secondDataBytes);
    // Initialize a field with push
    StoreCore.pushToField(table, key, 2, thirdDataBytes);

    // Create data to push
    bytes memory secondDataToPush;
    {
      uint32[] memory secondData = new uint32[](1);
      secondData[0] = 0x25262728;
      secondDataToPush = EncodeArray.encode(secondData);
    }
    bytes memory newSecondDataBytes = abi.encodePacked(secondDataBytes, secondDataToPush);

    // Push to second field
    // !gasreport push to field (1 slot, 1 uint32 item)
    StoreCore.pushToField(table, key, 1, secondDataToPush);

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
    // !gasreport push to field (2 slots, 10 uint32 items)
    StoreCore.pushToField(table, key, 2, thirdDataToPush);
  }

  function testUpdateInField() public {
    bytes32 table = keccak256("some.table");

    {
      // Register table's schema
      Schema schema = SchemaLib.encode(SchemaType.UINT256, SchemaType.UINT32_ARRAY, SchemaType.UINT64_ARRAY);
      StoreCore.registerSchema(table, schema, defaultKeySchema);
    }

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    // Create data
    bytes32 firstDataBytes = keccak256("some data");
    uint32[] memory secondData = new uint32[](2);
    secondData[0] = 0x11121314;
    secondData[1] = 0x15161718;
    bytes memory secondDataBytes = EncodeArray.encode(secondData);

    uint64[] memory thirdData = new uint64[](6);
    thirdData[0] = 0x1111111111111111;
    thirdData[1] = 0x2222222222222222;
    thirdData[2] = 0x3333333333333333;
    thirdData[3] = 0x4444444444444444;
    thirdData[4] = 0x5555555555555555;
    thirdData[5] = 0x6666666666666666;
    bytes memory thirdDataBytes = EncodeArray.encode(thirdData);

    // Set fields
    StoreCore.setField(table, key, 0, abi.encodePacked(firstDataBytes));
    StoreCore.setField(table, key, 1, secondDataBytes);
    StoreCore.setField(table, key, 2, thirdDataBytes);

    // Create data to use for the update
    bytes memory secondDataForUpdate;
    bytes memory newSecondDataBytes;
    {
      uint32[] memory _secondDataForUpdate = new uint32[](1);
      _secondDataForUpdate[0] = 0x25262728;
      secondDataForUpdate = EncodeArray.encode(_secondDataForUpdate);

      newSecondDataBytes = abi.encodePacked(secondData[0], _secondDataForUpdate[0]);
    }

    // Update index 1 in second field (4 = byte length of uint32)
    // !gasreport update in field (1 slot, 1 uint32 item)
    StoreCore.updateInField(table, key, 1, 4 * 1, secondDataForUpdate);

    // Create data for update
    bytes memory thirdDataForUpdate;
    bytes memory newThirdDataBytes;
    {
      uint64[] memory _thirdDataForUpdate = new uint64[](4);
      _thirdDataForUpdate[0] = 0x7777777777777777;
      _thirdDataForUpdate[1] = 0x8888888888888888;
      _thirdDataForUpdate[2] = 0x9999999999999999;
      _thirdDataForUpdate[3] = 0x0;
      thirdDataForUpdate = EncodeArray.encode(_thirdDataForUpdate);

      newThirdDataBytes = abi.encodePacked(
        thirdData[0],
        _thirdDataForUpdate[0],
        _thirdDataForUpdate[1],
        _thirdDataForUpdate[2],
        _thirdDataForUpdate[3],
        thirdData[5]
      );
    }

    // Update indexes 1,2,3,4 in third field (8 = byte length of uint64)
    // !gasreport push to field (2 slots, 6 uint64 items)
    StoreCore.updateInField(table, key, 2, 8 * 1, thirdDataForUpdate);
  }

  function testAccessEmptyData() public {
    bytes32 table = keccak256("some.table");
    Schema schema = SchemaLib.encode(SchemaType.UINT32, SchemaType.UINT32_ARRAY);

    StoreCore.registerSchema(table, schema, defaultKeySchema);

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    // !gasreport access non-existing record
    StoreCore.getRecord(table, key);

    // !gasreport access static field of non-existing record
    StoreCore.getField(table, key, 0);

    // !gasreport access dynamic field of non-existing record
    StoreCore.getField(table, key, 1);

    // !gasreport access length of dynamic field of non-existing record
    StoreCore.getFieldLength(table, key, 1, schema);

    // !gasreport access slice of dynamic field of non-existing record
    StoreCore.getFieldSlice(table, key, 1, schema, 0, 0);
  }

  function testHooks() public {
    bytes32 table = keccak256("some.table");
    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some key");

    // Register table's schema
    Schema schema = SchemaLib.encode(SchemaType.UINT128);
    StoreCore.registerSchema(table, schema, defaultKeySchema);

    // Create subscriber
    MirrorSubscriber subscriber = new MirrorSubscriber(table, schema, defaultKeySchema);

    // !gasreport register subscriber
    StoreCore.registerStoreHook(table, subscriber);

    bytes memory data = abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10));

    // !gasreport set record on table with subscriber
    StoreCore.setRecord(table, key, data);

    data = abi.encodePacked(bytes16(0x1112131415161718191a1b1c1d1e1f20));

    // !gasreport set static field on table with subscriber
    StoreCore.setField(table, key, 0, data);

    // !gasreport delete record on table with subscriber
    StoreCore.deleteRecord(table, key);
  }

  function testHooksDynamicData() public {
    bytes32 table = keccak256("some.table");
    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some key");

    // Register table's schema
    Schema schema = SchemaLib.encode(SchemaType.UINT128, SchemaType.UINT32_ARRAY);
    StoreCore.registerSchema(table, schema, defaultKeySchema);

    // Create subscriber
    MirrorSubscriber subscriber = new MirrorSubscriber(table, schema, defaultKeySchema);

    // !gasreport register subscriber
    StoreCore.registerStoreHook(table, subscriber);

    uint32[] memory arrayData = new uint32[](1);
    arrayData[0] = 0x01020304;
    bytes memory arrayDataBytes = EncodeArray.encode(arrayData);
    PackedCounter encodedArrayDataLength = PackedCounterLib.pack(uint40(arrayDataBytes.length));
    bytes memory dynamicData = abi.encodePacked(encodedArrayDataLength.unwrap(), arrayDataBytes);
    bytes memory staticData = abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10));
    bytes memory data = abi.encodePacked(staticData, dynamicData);

    // !gasreport set (dynamic) record on table with subscriber
    StoreCore.setRecord(table, key, data);

    // Update dynamic data
    arrayData[0] = 0x11121314;
    arrayDataBytes = EncodeArray.encode(arrayData);
    dynamicData = abi.encodePacked(encodedArrayDataLength.unwrap(), arrayDataBytes);
    data = abi.encodePacked(staticData, dynamicData);

    // !gasreport set (dynamic) field on table with subscriber
    StoreCore.setField(table, key, 1, arrayDataBytes);

    // !gasreport delete (dynamic) record on table with subscriber
    StoreCore.deleteRecord(table, key);
  }
}

bytes32 constant indexerTableId = keccak256("indexer.table");

contract MirrorSubscriber is IStoreHook {
  bytes32 _table;

  constructor(bytes32 table, Schema schema, Schema keySchema) {
    IStore(msg.sender).registerSchema(indexerTableId, schema, keySchema);
    _table = table;
  }

  function onSetRecord(bytes32 table, bytes32[] memory key, bytes memory data) public {
    if (table != table) revert("invalid table");
    StoreSwitch.setRecord(indexerTableId, key, data);
  }

  function onBeforeSetField(bytes32 table, bytes32[] memory key, uint8 schemaIndex, bytes memory data) public {
    if (table != table) revert("invalid table");
    StoreSwitch.setField(indexerTableId, key, schemaIndex, data);
  }

  function onAfterSetField(bytes32, bytes32[] memory, uint8, bytes memory) public {}

  function onDeleteRecord(bytes32 table, bytes32[] memory key) public {
    if (table != table) revert("invalid table");
    StoreSwitch.deleteRecord(indexerTableId, key);
  }
}
