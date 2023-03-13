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
import { StoreView } from "../src/StoreView.sol";
import { IStore, IStoreHook } from "../src/IStore.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";
import { StoreMetadataData, StoreMetadata } from "../src/tables/StoreMetadata.sol";

struct TestStruct {
  uint128 firstData;
  uint32[] secondData;
  uint32[] thirdData;
}

contract StoreCoreTest is Test, StoreView {
  TestStruct private testStruct;
  mapping(uint256 => bytes) private testMapping;
  Schema defaultKeySchema = SchemaLib.encode(SchemaType.BYTES32);

  // Expose an external setRecord function for testing purposes of indexers (see testHooks)
  function setRecord(uint256 table, bytes32[] calldata key, bytes calldata data) public override {
    StoreCore.setRecord(table, key, data);
  }

  // Expose an external setField function for testing purposes of indexers (see testHooks)
  function setField(uint256 table, bytes32[] calldata key, uint8 schemaIndex, bytes calldata data) public override {
    StoreCore.setField(table, key, schemaIndex, data);
  }

  // Expose an external pushToField function for testing purposes of indexers (see testHooks)
  function pushToField(
    uint256 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush
  ) public override {
    StoreCore.pushToField(table, key, schemaIndex, dataToPush);
  }

  // Expose an external deleteRecord function for testing purposes of indexers (see testHooks)
  function deleteRecord(uint256 table, bytes32[] calldata key) public override {
    StoreCore.deleteRecord(table, key);
  }

  // Expose an external registerSchema function for testing purposes of indexers (see testHooks)
  function registerSchema(uint256 table, Schema schema, Schema keySchema) public override {
    StoreCore.registerSchema(table, schema, keySchema);
  }

  function testRegisterAndGetSchema() public {
    Schema schema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);
    Schema keySchema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT16);

    uint256 table = uint256(keccak256("some.table"));

    // Expect a StoreSetRecord event to be emitted
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32(table);
    vm.expectEmit(true, true, true, true);
    emit StoreSetRecord(StoreCoreInternal.SCHEMA_TABLE, key, abi.encodePacked(schema.unwrap(), keySchema.unwrap()));

    // !gasreport StoreCore: register schema
    StoreCore.registerSchema(table, schema, keySchema);

    // !gasreport StoreCore: get schema (warm)
    Schema loadedSchema = StoreCore.getSchema(table);

    assertEq(loadedSchema.unwrap(), schema.unwrap());

    // !gasreport StoreCore: get key schema (warm)
    Schema loadedKeySchema = StoreCore.getKeySchema(table);
    assertEq(loadedKeySchema.unwrap(), keySchema.unwrap());
  }

  function testFailRegisterInvalidSchema() public {
    StoreCore.registerSchema(
      uint256(keccak256("table")),
      Schema.wrap(keccak256("random bytes as schema")),
      Schema.wrap(keccak256("random bytes as key schema"))
    );
  }

  function testHasSchema() public {
    Schema schema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);
    uint256 table = uint256(keccak256("some.table"));
    uint256 table2 = uint256(keccak256("other.table"));
    StoreCore.registerSchema(table, schema, defaultKeySchema);

    // !gasreport Check for existence of table (existent)
    StoreCore.hasTable(table);

    // !gasreport check for existence of table (non-existent)
    StoreCore.hasTable(table2);

    assertTrue(StoreCore.hasTable(table));
    assertFalse(StoreCore.hasTable(table2));
  }

  function testSetMetadata() public {
    uint256 table = uint256(keccak256("some.table"));
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

    // Get metadata for table
    StoreMetadataData memory metadata = StoreMetadata.get(table);

    assertEq(metadata.tableName, tableName);
    assertEq(metadata.abiEncodedFieldNames, abi.encode(fieldNames));
  }

  function testlSetMetadataRevert() public {
    uint256 table = uint256(keccak256("some.table"));
    Schema schema = SchemaLib.encode(SchemaType.UINT8);
    Schema keySchema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);
    string memory tableName = "someTable";
    string[] memory fieldNames = new string[](2);
    fieldNames[0] = "field1";
    fieldNames[1] = "field2";

    // Register table
    StoreCore.registerSchema(table, schema, keySchema);

    vm.expectRevert(abi.encodeWithSelector(StoreCore.StoreCore_InvalidFieldNamesLength.selector, 1, 2));
    StoreCore.setMetadata(table, tableName, fieldNames);
  }

  function testSetAndGetDynamicDataLength() public {
    uint256 table = uint256(keccak256("some.table"));

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

    PackedCounter encodedLength = StoreCoreInternal._loadEncodedDynamicDataLength(table, key);
    assertEq(encodedLength.atIndex(0), 10);
    assertEq(encodedLength.atIndex(1), 0);
    assertEq(encodedLength.total(), 10);

    // Set dynamic data length of dynamic index 1
    // !gasreport set dynamic length of dynamic index 1
    StoreCoreInternal._setDynamicDataLengthAtIndex(table, key, 1, 99);

    encodedLength = StoreCoreInternal._loadEncodedDynamicDataLength(table, key);
    assertEq(encodedLength.atIndex(0), 10);
    assertEq(encodedLength.atIndex(1), 99);
    assertEq(encodedLength.total(), 109);

    // Reduce dynamic data length of dynamic index 0 again
    // !gasreport reduce dynamic length of dynamic index 0
    StoreCoreInternal._setDynamicDataLengthAtIndex(table, key, 0, 5);

    encodedLength = StoreCoreInternal._loadEncodedDynamicDataLength(table, key);
    assertEq(encodedLength.atIndex(0), 5);
    assertEq(encodedLength.atIndex(1), 99);
    assertEq(encodedLength.total(), 104);
  }

  function testSetAndGetStaticData() public {
    // Register table's schema
    Schema schema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);

    uint256 table = uint256(keccak256("some.table"));
    StoreCore.registerSchema(table, schema, defaultKeySchema);

    // Set data
    bytes memory data = abi.encodePacked(bytes1(0x01), bytes2(0x0203), bytes1(0x04), bytes2(0x0506));

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    // Expect a StoreSetRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetRecord(table, key, data);

    // !gasreport set static record (1 slot)
    StoreCore.setRecord(table, key, data);

    // Get data
    // !gasreport get static record (1 slot)
    bytes memory loadedData = StoreCore.getRecord(table, key, schema);

    assertTrue(Bytes.equals(data, loadedData));
  }

  function testFailSetAndGetStaticData() public {
    // Register table's schema
    Schema schema = SchemaLib.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);
    uint256 table = uint256(keccak256("some.table"));
    StoreCore.registerSchema(table, schema, defaultKeySchema);

    // Set data
    bytes memory data = abi.encodePacked(bytes1(0x01), bytes2(0x0203), bytes1(0x04));

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    // This should fail because the data is not 6 bytes long
    StoreCore.setRecord(table, key, data);
  }

  function testSetAndGetStaticDataSpanningWords() public {
    // Register table's schema
    Schema schema = SchemaLib.encode(SchemaType.UINT128, SchemaType.UINT256);
    uint256 table = uint256(keccak256("some.table"));
    StoreCore.registerSchema(table, schema, defaultKeySchema);

    // Set data
    bytes memory data = abi.encodePacked(
      bytes16(0x0102030405060708090a0b0c0d0e0f10),
      bytes32(0x1112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30)
    );

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    // Expect a StoreSetRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetRecord(table, key, data);

    // !gasreport set static record (2 slots)
    StoreCore.setRecord(table, key, data);

    // Get data
    // !gasreport get static record (2 slots)
    bytes memory loadedData = StoreCore.getRecord(table, key, schema);

    assertTrue(Bytes.equals(data, loadedData));
  }

  function testSetAndGetDynamicData() public {
    uint256 table = uint256(keccak256("some.table"));

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
      uint16[] memory dynamicLengths = new uint16[](2);
      dynamicLengths[0] = uint16(secondDataBytes.length);
      dynamicLengths[1] = uint16(thirdDataBytes.length);
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

    // Expect a StoreSetRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetRecord(table, key, data);

    // Set data
    // !gasreport set complex record with dynamic data (4 slots)
    StoreCore.setRecord(table, key, data);

    // Get data
    // !gasreport get complex record with dynamic data (4 slots)
    bytes memory loadedData = StoreCore.getRecord(table, key);

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

    // !gasreport compare: Set complex record with dynamic data using native solidity
    testStruct = _testStruct;

    // !gasreport compare: Set complex record with dynamic data using abi.encode
    testMapping[1234] = abi.encode(_testStruct);
  }

  function testSetAndGetField() public {
    uint256 table = uint256(keccak256("some.table"));

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

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(table, key, 0, abi.encodePacked(firstDataBytes));

    // Set first field
    // !gasreport set static field (1 slot)
    StoreCore.setField(table, key, 0, abi.encodePacked(firstDataBytes));

    ////////////////
    // Static data
    ////////////////

    // Get first field
    // !gasreport get static field (1 slot)
    bytes memory loadedData = StoreCore.getField(table, key, 0);

    // Verify loaded data is correct
    assertEq(loadedData.length, 16);
    assertEq(bytes16(loadedData), bytes16(firstDataBytes));

    // Verify the second index is not set yet
    assertEq(uint256(bytes32(StoreCore.getField(table, key, 1))), 0);

    // Set second field
    bytes32 secondDataBytes = keccak256("some data");

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(table, key, 1, abi.encodePacked(secondDataBytes));

    // !gasreport set static field (overlap 2 slot)
    StoreCore.setField(table, key, 1, abi.encodePacked(secondDataBytes));

    // Get second field
    // !gasreport get static field (overlap 2 slot)
    loadedData = StoreCore.getField(table, key, 1);

    // Verify loaded data is correct
    assertEq(loadedData.length, 32);
    assertEq(bytes32(loadedData), secondDataBytes);

    // Verify the first field didn't change
    assertEq(bytes16(StoreCore.getField(table, key, 0)), bytes16(firstDataBytes));

    // Verify the full static data is correct
    assertEq(StoreCore.getSchema(table).staticDataLength(), 48);
    assertEq(Bytes.slice16(StoreCore.getRecord(table, key), 0), firstDataBytes);
    assertEq(Bytes.slice32(StoreCore.getRecord(table, key), 16), secondDataBytes);
    assertEq(
      keccak256(SliceLib.getSubslice(StoreCore.getRecord(table, key), 0, 48).toBytes()),
      keccak256(abi.encodePacked(firstDataBytes, secondDataBytes))
    );

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

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(table, key, 2, thirdDataBytes);

    // Set third field
    // !gasreport set dynamic field (1 slot, first dynamic field)
    StoreCore.setField(table, key, 2, thirdDataBytes);

    // Get third field
    // !gasreport get dynamic field (1 slot, first dynamic field)
    loadedData = StoreCore.getField(table, key, 2);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(loadedData).decodeArray_uint32().length, 2);
    assertEq(loadedData.length, thirdDataBytes.length);
    assertEq(keccak256(loadedData), keccak256(thirdDataBytes));

    // Verify the fourth field is not set yet
    assertEq(StoreCore.getField(table, key, 3).length, 0);

    // Verify none of the previous fields were impacted
    assertEq(bytes16(StoreCore.getField(table, key, 0)), bytes16(firstDataBytes));
    assertEq(bytes32(StoreCore.getField(table, key, 1)), bytes32(secondDataBytes));

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(table, key, 3, fourthDataBytes);

    // Set fourth field
    // !gasreport set dynamic field (1 slot, second dynamic field)
    StoreCore.setField(table, key, 3, fourthDataBytes);

    // Get fourth field
    // !gasreport get dynamic field (1 slot, second dynamic field)
    loadedData = StoreCore.getField(table, key, 3);

    // Verify loaded data is correct
    assertEq(loadedData.length, fourthDataBytes.length);
    assertEq(keccak256(loadedData), keccak256(fourthDataBytes));

    // Verify all fields are correct
    PackedCounter encodedLengths = PackedCounterLib.pack(uint16(thirdDataBytes.length), uint16(fourthDataBytes.length));
    assertEq(
      keccak256(StoreCore.getRecord(table, key)),
      keccak256(
        abi.encodePacked(firstDataBytes, secondDataBytes, encodedLengths.unwrap(), thirdDataBytes, fourthDataBytes)
      )
    );
  }

  function testDeleteData() public {
    uint256 table = uint256(keccak256("some.table"));

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
      uint16[] memory dynamicLengths = new uint16[](2);
      dynamicLengths[0] = uint16(secondDataBytes.length);
      dynamicLengths[1] = uint16(thirdDataBytes.length);
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

    // Get data
    bytes memory loadedData = StoreCore.getRecord(table, key);

    assertEq(loadedData.length, data.length);
    assertEq(keccak256(loadedData), keccak256(data));

    // Expect a StoreDeleteRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreDeleteRecord(table, key);

    // Delete data
    // !gasreport delete record (complex data, 3 slots)
    StoreCore.deleteRecord(table, key);

    // Verify data is deleted
    loadedData = StoreCore.getRecord(table, key);
    assertEq(keccak256(loadedData), keccak256(new bytes(schema.staticDataLength())));
  }

  function testPushToField() public {
    uint256 table = uint256(keccak256("some.table"));

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

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(table, key, 1, newSecondDataBytes);

    // Push to second field
    // !gasreport push to field (1 slot, 1 uint32 item)
    StoreCore.pushToField(table, key, 1, secondDataToPush);

    // Get second field
    bytes memory loadedData = StoreCore.getField(table, key, 1);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(loadedData).decodeArray_uint32().length, 2 + 1);
    assertEq(loadedData.length, newSecondDataBytes.length);
    assertEq(loadedData, newSecondDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(StoreCore.getField(table, key, 0)), firstDataBytes);
    assertEq(StoreCore.getField(table, key, 2), thirdDataBytes);

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
    bytes memory newThirdDataBytes = abi.encodePacked(thirdDataBytes, thirdDataToPush);

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(table, key, 2, newThirdDataBytes);

    // Push to third field
    // !gasreport push to field (2 slots, 10 uint32 items)
    StoreCore.pushToField(table, key, 2, thirdDataToPush);

    // Get third field
    loadedData = StoreCore.getField(table, key, 2);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(loadedData).decodeArray_uint32().length, 3 + 10);
    assertEq(loadedData.length, newThirdDataBytes.length);
    assertEq(loadedData, newThirdDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(StoreCore.getField(table, key, 0)), firstDataBytes);
    assertEq(StoreCore.getField(table, key, 1), newSecondDataBytes);
  }

  function testAccessEmptyData() public {
    uint256 table = uint256(keccak256("some.table"));
    Schema schema = SchemaLib.encode(SchemaType.UINT32, SchemaType.UINT32_ARRAY);

    StoreCore.registerSchema(table, schema, defaultKeySchema);

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    // !gasreport access non-existing record
    bytes memory data1 = StoreCore.getRecord(table, key);
    assertEq(data1.length, schema.staticDataLength());

    // !gasreport access static field of non-existing record
    bytes memory data2 = StoreCore.getField(table, key, 0);
    assertEq(data2.length, schema.staticDataLength());

    // !gasreport access dynamic field of non-existing record
    bytes memory data3 = StoreCore.getField(table, key, 1);
    assertEq(data3.length, 0);
  }

  function testHooks() public {
    uint256 table = uint256(keccak256("some.table"));
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

    // Get data from indexed table - the indexer should have mirrored the data there
    bytes memory indexedData = StoreCore.getRecord(indexerTableId, key);
    assertEq(keccak256(data), keccak256(indexedData));

    data = abi.encodePacked(bytes16(0x1112131415161718191a1b1c1d1e1f20));

    // !gasreport set static field on table with subscriber
    StoreCore.setField(table, key, 0, data);

    // Get data from indexed table - the indexer should have mirrored the data there
    indexedData = StoreCore.getRecord(indexerTableId, key);
    assertEq(keccak256(data), keccak256(indexedData));

    // !gasreport delete record on table with subscriber
    StoreCore.deleteRecord(table, key);

    // Get data from indexed table - the indexer should have mirrored the data there
    indexedData = StoreCore.getRecord(indexerTableId, key);
    assertEq(keccak256(indexedData), keccak256(abi.encodePacked(bytes16(0))));
  }

  function testHooksDynamicData() public {
    uint256 table = uint256(keccak256("some.table"));
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
    PackedCounter encodedArrayDataLength = PackedCounterLib.pack(uint16(arrayDataBytes.length));
    bytes memory dynamicData = abi.encodePacked(encodedArrayDataLength.unwrap(), arrayDataBytes);
    bytes memory staticData = abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10));
    bytes memory data = abi.encodePacked(staticData, dynamicData);

    // !gasreport set (dynamic) record on table with subscriber
    StoreCore.setRecord(table, key, data);

    // Get data from indexed table - the indexer should have mirrored the data there
    bytes memory indexedData = StoreCore.getRecord(indexerTableId, key);
    assertEq(keccak256(data), keccak256(indexedData));

    // Update dynamic data
    arrayData[0] = 0x11121314;
    arrayDataBytes = EncodeArray.encode(arrayData);
    dynamicData = abi.encodePacked(encodedArrayDataLength.unwrap(), arrayDataBytes);
    data = abi.encodePacked(staticData, dynamicData);

    // !gasreport set (dynamic) field on table with subscriber
    StoreCore.setField(table, key, 1, arrayDataBytes);

    // Get data from indexed table - the indexer should have mirrored the data there
    indexedData = StoreCore.getRecord(indexerTableId, key);
    assertEq(keccak256(data), keccak256(indexedData));

    // !gasreport delete (dynamic) record on table with subscriber
    StoreCore.deleteRecord(table, key);

    // Get data from indexed table - the indexer should have mirrored the data there
    indexedData = StoreCore.getRecord(indexerTableId, key);
    assertEq(keccak256(indexedData), keccak256(abi.encodePacked(bytes16(0))));
  }
}

uint256 constant indexerTableId = uint256(keccak256("indexer.table"));

contract MirrorSubscriber is IStoreHook {
  uint256 _table;

  constructor(uint256 table, Schema schema, Schema keySchema) {
    IStore(msg.sender).registerSchema(indexerTableId, schema, keySchema);
    _table = table;
  }

  function onSetRecord(uint256 table, bytes32[] memory key, bytes memory data) public {
    if (table != table) revert("invalid table");
    StoreSwitch.setRecord(indexerTableId, key, data);
  }

  function onSetField(uint256 table, bytes32[] memory key, uint8 schemaIndex, bytes memory data) public {
    if (table != table) revert("invalid table");
    StoreSwitch.setField(indexerTableId, key, schemaIndex, data);
  }

  function onDeleteRecord(uint256 table, bytes32[] memory key) public {
    if (table != table) revert("invalid table");
    StoreSwitch.deleteRecord(indexerTableId, key);
  }
}
