// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
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
import { StoreSwitch } from "../src/StoreSwitch.sol";
import { StoreMetadataData, StoreMetadata } from "../src/codegen/Tables.sol";
import { SchemaEncodeHelper } from "./SchemaEncodeHelper.sol";
import { StoreMock } from "./StoreMock.sol";
import { MirrorSubscriber, indexerTableId } from "./MirrorSubscriber.sol";

struct TestStruct {
  uint128 firstData;
  uint32[] secondData;
  uint32[] thirdData;
}

contract StoreCoreTest is Test, StoreMock {
  TestStruct private testStruct;

  mapping(uint256 => bytes) private testMapping;
  Schema defaultKeySchema = SchemaEncodeHelper.encode(SchemaType.BYTES32);

  function testRegisterAndGetSchema() public {
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);
    Schema keySchema = SchemaEncodeHelper.encode(SchemaType.UINT8, SchemaType.UINT16);

    bytes32 table = keccak256("some.table");

    // Expect a StoreSetRecord event to be emitted
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32(table);
    vm.expectEmit(true, true, true, true);
    emit StoreSetRecord(StoreCoreInternal.SCHEMA_TABLE, key, abi.encodePacked(schema.unwrap(), keySchema.unwrap()));

    IStore(this).registerSchema(table, schema, keySchema);

    Schema loadedSchema = IStore(this).getSchema(table);

    assertEq(loadedSchema.unwrap(), schema.unwrap());

    Schema loadedKeySchema = IStore(this).getKeySchema(table);
    assertEq(loadedKeySchema.unwrap(), keySchema.unwrap());

    Schema schemaTableSchema = SchemaLib.encode(SchemaType.BYTES32, SchemaType.BYTES32);
    bytes memory schemaRecord = IStore(this).getRecord(StoreCoreInternal.SCHEMA_TABLE, key, schemaTableSchema);
    assertEq(schemaRecord, abi.encodePacked(schema.unwrap(), keySchema.unwrap()));
  }

  function testFailRegisterInvalidSchema() public {
    IStore(this).registerSchema(
      keccak256("table"),
      Schema.wrap(keccak256("random bytes as schema")),
      Schema.wrap(keccak256("random bytes as key schema"))
    );
  }

  function testHasSchema() public {
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);
    bytes32 table = keccak256("some.table");
    bytes32 table2 = keccak256("other.table");
    IStore(this).registerSchema(table, schema, defaultKeySchema);

    assertTrue(StoreCore.hasTable(table));
    assertFalse(StoreCore.hasTable(table2));

    IStore(this).getSchema(table);
    IStore(this).getKeySchema(table);

    vm.expectRevert(
      abi.encodeWithSelector(IStoreErrors.StoreCore_TableNotFound.selector, table2, string(abi.encodePacked(table2)))
    );
    IStore(this).getSchema(table2);

    vm.expectRevert(
      abi.encodeWithSelector(IStoreErrors.StoreCore_TableNotFound.selector, table2, string(abi.encodePacked(table2)))
    );
    IStore(this).getKeySchema(table2);
  }

  function testSetMetadata() public {
    bytes32 table = keccak256("some.table");
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT8, SchemaType.UINT16);
    Schema keySchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );
    string memory tableName = "someTable";
    string[] memory fieldNames = new string[](2);
    fieldNames[0] = "field1";
    fieldNames[1] = "field2";

    // Register table
    IStore(this).registerSchema(table, schema, keySchema);

    IStore(this).setMetadata(table, tableName, fieldNames);

    // Get metadata for table
    StoreMetadataData memory metadata = StoreMetadata.get(table);

    assertEq(metadata.tableName, tableName);
    assertEq(metadata.abiEncodedFieldNames, abi.encode(fieldNames));
  }

  function testSetMetadataRevert() public {
    bytes32 table = keccak256("some.table");
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT8);
    Schema keySchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );
    string memory tableName = "someTable";
    string[] memory fieldNames = new string[](2);
    fieldNames[0] = "field1";
    fieldNames[1] = "field2";

    // Register table
    IStore(this).registerSchema(table, schema, keySchema);

    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.StoreCore_InvalidFieldNamesLength.selector, 1, 2));
    IStore(this).setMetadata(table, tableName, fieldNames);
  }

  function testSetAndGetDynamicDataLength() public {
    bytes32 table = keccak256("some.table");

    Schema schema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT32,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT32_ARRAY
    );

    // Register schema
    IStore(this).registerSchema(table, schema, defaultKeySchema);

    // Create some key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some key");

    // Set dynamic data length of dynamic index 0
    StoreCoreInternal._setDynamicDataLengthAtIndex(table, key, 0, 10);

    PackedCounter encodedLength = StoreCoreInternal._loadEncodedDynamicDataLength(table, key);
    assertEq(encodedLength.atIndex(0), 10);
    assertEq(encodedLength.atIndex(1), 0);
    assertEq(encodedLength.total(), 10);

    // Set dynamic data length of dynamic index 1
    StoreCoreInternal._setDynamicDataLengthAtIndex(table, key, 1, 99);

    encodedLength = StoreCoreInternal._loadEncodedDynamicDataLength(table, key);
    assertEq(encodedLength.atIndex(0), 10);
    assertEq(encodedLength.atIndex(1), 99);
    assertEq(encodedLength.total(), 109);

    // Reduce dynamic data length of dynamic index 0 again
    StoreCoreInternal._setDynamicDataLengthAtIndex(table, key, 0, 5);

    encodedLength = StoreCoreInternal._loadEncodedDynamicDataLength(table, key);
    assertEq(encodedLength.atIndex(0), 5);
    assertEq(encodedLength.atIndex(1), 99);
    assertEq(encodedLength.total(), 104);
  }

  function testSetAndGetStaticData() public {
    // Register table's schema
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);

    bytes32 table = keccak256("some.table");
    IStore(this).registerSchema(table, schema, defaultKeySchema);

    // Set data
    bytes memory data = abi.encodePacked(bytes1(0x01), bytes2(0x0203), bytes1(0x04), bytes2(0x0506));

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    // Expect a StoreSetRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetRecord(table, key, data);

    IStore(this).setRecord(table, key, data, schema);

    // Get data
    bytes memory loadedData = IStore(this).getRecord(table, key, schema);

    assertTrue(Bytes.equals(data, loadedData));
  }

  function testFailSetAndGetStaticData() public {
    // Register table's schema
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT8, SchemaType.UINT16, SchemaType.UINT8, SchemaType.UINT16);
    bytes32 table = keccak256("some.table");
    IStore(this).registerSchema(table, schema, defaultKeySchema);

    // Set data
    bytes memory data = abi.encodePacked(bytes1(0x01), bytes2(0x0203), bytes1(0x04));

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    // This should fail because the data is not 6 bytes long
    IStore(this).setRecord(table, key, data, schema);
  }

  function testSetAndGetStaticDataSpanningWords() public {
    // Register table's schema
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT128, SchemaType.UINT256);
    bytes32 table = keccak256("some.table");
    IStore(this).registerSchema(table, schema, defaultKeySchema);

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

    IStore(this).setRecord(table, key, data, schema);

    // Get data
    bytes memory loadedData = IStore(this).getRecord(table, key, schema);

    assertTrue(Bytes.equals(data, loadedData));
  }

  function testSetAndGetDynamicData() public {
    bytes32 table = keccak256("some.table");

    // Register table's schema
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT128, SchemaType.UINT32_ARRAY, SchemaType.UINT32_ARRAY);
    IStore(this).registerSchema(table, schema, defaultKeySchema);

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

    // Expect a StoreSetRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetRecord(table, key, data);

    // Set data
    IStore(this).setRecord(table, key, data, schema);

    // Get data
    bytes memory loadedData = IStore(this).getRecord(table, key, schema);

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

    testStruct = _testStruct;

    testMapping[1234] = abi.encode(_testStruct);
  }

  function testSetAndGetField() public {
    bytes32 table = keccak256("some.table");

      // Register table's schema
      Schema schema = SchemaEncodeHelper.encode(
        SchemaType.UINT128,
        SchemaType.UINT256,
        SchemaType.UINT32_ARRAY,
        SchemaType.UINT32_ARRAY
      );
      IStore(this).registerSchema(table, schema, defaultKeySchema);

    bytes16 firstDataBytes = bytes16(0x0102030405060708090a0b0c0d0e0f10);

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    bytes memory firstDataPacked = abi.encodePacked(firstDataBytes);

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(table, key, 0, firstDataPacked);

    // Set first field
    IStore(this).setField(table, key, 0, firstDataPacked, schema);

    ////////////////
    // Static data
    ////////////////

    // Get first field
    bytes memory loadedData = IStore(this).getField(table, key, 0, schema);

    // Verify loaded data is correct
    assertEq(loadedData.length, 16);
    assertEq(bytes16(loadedData), bytes16(firstDataBytes));

    // Verify the second index is not set yet
    assertEq(uint256(bytes32(IStore(this).getField(table, key, 1, schema))), 0);

    // Set second field
    bytes32 secondDataBytes = keccak256("some data");

    bytes memory secondDataPacked = abi.encodePacked(secondDataBytes);

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(table, key, 1, secondDataPacked);

    IStore(this).setField(table, key, 1, secondDataPacked, schema);

    // Get second field
    loadedData = IStore(this).getField(table, key, 1, schema);

    // Verify loaded data is correct
    assertEq(loadedData.length, 32);
    assertEq(bytes32(loadedData), secondDataBytes);

    // Verify the first field didn't change
    assertEq(bytes16(IStore(this).getField(table, key, 0, schema)), bytes16(firstDataBytes));

    // Verify the full static data is correct
    assertEq(IStore(this).getSchema(table).staticDataLength(), 48);
    assertEq(Bytes.slice16(IStore(this).getRecord(table, key, schema), 0), firstDataBytes);
    assertEq(Bytes.slice32(IStore(this).getRecord(table, key, schema), 16), secondDataBytes);
    assertEq(
      keccak256(SliceLib.getSubslice(IStore(this).getRecord(table, key, schema), 0, 48).toBytes()),
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
    IStore(this).setField(table, key, 2, thirdDataBytes, schema);

    // Get third field
    loadedData = IStore(this).getField(table, key, 2, schema);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(loadedData).decodeArray_uint32().length, 2);
    assertEq(loadedData.length, thirdDataBytes.length);
    assertEq(keccak256(loadedData), keccak256(thirdDataBytes));

    // Verify the fourth field is not set yet
    assertEq(IStore(this).getField(table, key, 3, schema).length, 0);

    // Verify none of the previous fields were impacted
    assertEq(bytes16(IStore(this).getField(table, key, 0, schema)), bytes16(firstDataBytes));
    assertEq(bytes32(IStore(this).getField(table, key, 1, schema)), bytes32(secondDataBytes));

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(table, key, 3, fourthDataBytes);

    // Set fourth field
    IStore(this).setField(table, key, 3, fourthDataBytes, schema);

    // Get fourth field
    loadedData = IStore(this).getField(table, key, 3, schema);

    // Verify loaded data is correct
    assertEq(loadedData.length, fourthDataBytes.length);
    assertEq(keccak256(loadedData), keccak256(fourthDataBytes));

    // Verify all fields are correct
    PackedCounter encodedLengths = PackedCounterLib.pack(uint40(thirdDataBytes.length), uint40(fourthDataBytes.length));
    assertEq(
      keccak256(IStore(this).getRecord(table, key, schema)),
      keccak256(
        abi.encodePacked(firstDataBytes, secondDataBytes, encodedLengths.unwrap(), thirdDataBytes, fourthDataBytes)
      )
    );
  }

  function testDeleteData() public {
    bytes32 table = keccak256("some.table");

    // Register table's schema
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT128, SchemaType.UINT32_ARRAY, SchemaType.UINT32_ARRAY);
    IStore(this).registerSchema(table, schema, defaultKeySchema);

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
    IStore(this).setRecord(table, key, data, schema);

    // Get data
    bytes memory loadedData = IStore(this).getRecord(table, key, schema);

    assertEq(loadedData.length, data.length);
    assertEq(keccak256(loadedData), keccak256(data));

    // Expect a StoreDeleteRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreDeleteRecord(table, key);

    // Delete data
    IStore(this).deleteRecord(table, key, schema);

    // Verify data is deleted
    loadedData = IStore(this).getRecord(table, key, schema);
    assertEq(keccak256(loadedData), keccak256(new bytes(schema.staticDataLength())));
  }

  struct TestPushToFieldData {
    bytes32 table;
    bytes32[] key;
    bytes32 firstDataBytes;
    bytes secondDataBytes;
    bytes thirdDataBytes;
    bytes secondDataToPush;
    bytes newSecondDataBytes;
    bytes loadedData;
    bytes thirdDataToPush;
    bytes newThirdDataBytes;
  }

  function testPushToField() public {
    TestPushToFieldData memory data = TestPushToFieldData(0, new bytes32[](0), 0, "", "", "", "", "", "", "");

    data.table = keccak256("some.table");

    // Register table's schema
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT256, SchemaType.UINT32_ARRAY, SchemaType.UINT32_ARRAY);
    IStore(this).registerSchema(data.table, schema, defaultKeySchema);

    // Create key
    data.key = new bytes32[](1);
    data.key[0] = bytes32("some.key");

    // Create data
    data.firstDataBytes = keccak256("some data");
    {
      uint32[] memory secondData = new uint32[](2);
      secondData[0] = 0x11121314;
      secondData[1] = 0x15161718;
      data.secondDataBytes = EncodeArray.encode(secondData);
    }

    {
      uint32[] memory thirdData = new uint32[](3);
      thirdData[0] = 0x191a1b1c;
      thirdData[1] = 0x1d1e1f20;
      thirdData[2] = 0x21222324;
      data.thirdDataBytes = EncodeArray.encode(thirdData);
    }

    // Set fields
    IStore(this).setField(data.table, data.key, 0, abi.encodePacked(data.firstDataBytes), schema);
    IStore(this).setField(data.table, data.key, 1, data.secondDataBytes, schema);
    // Initialize a field with push
    IStore(this).pushToField(data.table, data.key, 2, data.thirdDataBytes, schema);

    // Create data to push
    {
      uint32[] memory secondData = new uint32[](1);
      secondData[0] = 0x25262728;
      data.secondDataToPush = EncodeArray.encode(secondData);
    }
    data.newSecondDataBytes = abi.encodePacked(data.secondDataBytes, data.secondDataToPush);

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(data.table, data.key, 1, data.newSecondDataBytes);

    // Push to second field
    IStore(this).pushToField(data.table, data.key, 1, data.secondDataToPush, schema);

    // Get second field
    data.loadedData = IStore(this).getField(data.table, data.key, 1, schema);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(data.loadedData).decodeArray_uint32().length, 2 + 1);
    assertEq(data.loadedData.length, data.newSecondDataBytes.length);
    assertEq(data.loadedData, data.newSecondDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(IStore(this).getField(data.table, data.key, 0, schema)), data.firstDataBytes);
    assertEq(IStore(this).getField(data.table, data.key, 2, schema), data.thirdDataBytes);

    // Create data to push
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
      data.thirdDataToPush = EncodeArray.encode(thirdData);
    }
    data.newThirdDataBytes = abi.encodePacked(data.thirdDataBytes, data.thirdDataToPush);

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(data.table, data.key, 2, data.newThirdDataBytes);

    // Push to third field
    IStore(this).pushToField(data.table, data.key, 2, data.thirdDataToPush, schema);

    // Get third field
    data.loadedData = IStore(this).getField(data.table, data.key, 2, schema);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(data.loadedData).decodeArray_uint32().length, 3 + 10);
    assertEq(data.loadedData.length, data.newThirdDataBytes.length);
    assertEq(data.loadedData, data.newThirdDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(IStore(this).getField(data.table, data.key, 0, schema)), data.firstDataBytes);
    assertEq(IStore(this).getField(data.table, data.key, 1, schema), data.newSecondDataBytes);
  }

  struct TestUpdateInFieldData {
    bytes32 table;
    bytes32[] key;
    bytes32 firstDataBytes;
    uint32[] secondData;
    bytes secondDataBytes;
    bytes secondDataForUpdate;
    bytes newSecondDataBytes;
    uint64[] thirdData;
    bytes thirdDataBytes;
    bytes thirdDataForUpdate;
    bytes newThirdDataBytes;
    bytes loadedData;
  }

  function testUpdateInField() public {
    TestUpdateInFieldData memory data = TestUpdateInFieldData(
      0,
      new bytes32[](0),
      0,
      new uint32[](0),
      "",
      "",
      "",
      new uint64[](0),
      "",
      "",
      "",
      ""
    );

    data.table = keccak256("some.table");

    // Register table's schema
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT256, SchemaType.UINT32_ARRAY, SchemaType.UINT64_ARRAY);
    IStore(this).registerSchema(data.table, schema, defaultKeySchema);

    // Create key
    data.key = new bytes32[](1);
    data.key[0] = bytes32("some.key");

    // Create data
    data.firstDataBytes = keccak256("some data");
    data.secondData = new uint32[](2);
    data.secondData[0] = 0x11121314;
    data.secondData[1] = 0x15161718;
    data.secondDataBytes = EncodeArray.encode(data.secondData);

    data.thirdData = new uint64[](6);
    data.thirdData[0] = 0x1111111111111111;
    data.thirdData[1] = 0x2222222222222222;
    data.thirdData[2] = 0x3333333333333333;
    data.thirdData[3] = 0x4444444444444444;
    data.thirdData[4] = 0x5555555555555555;
    data.thirdData[5] = 0x6666666666666666;
    data.thirdDataBytes = EncodeArray.encode(data.thirdData);

    // Set fields
    IStore(this).setField(data.table, data.key, 0, abi.encodePacked(data.firstDataBytes), schema);
    IStore(this).setField(data.table, data.key, 1, data.secondDataBytes, schema);
    IStore(this).setField(data.table, data.key, 2, data.thirdDataBytes, schema);

    // Create data to use for the update
    {
      uint32[] memory _secondDataForUpdate = new uint32[](1);
      _secondDataForUpdate[0] = 0x25262728;
      data.secondDataForUpdate = EncodeArray.encode(_secondDataForUpdate);

      data.newSecondDataBytes = abi.encodePacked(data.secondData[0], _secondDataForUpdate[0]);
    }

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(data.table, data.key, 1, data.newSecondDataBytes);

    // Update index 1 in second field (4 = byte length of uint32)
    IStore(this).updateInField(data.table, data.key, 1, 4 * 1, data.secondDataForUpdate, schema);

    // Get second field
    data.loadedData = IStore(this).getField(data.table, data.key, 1, schema);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(data.loadedData).decodeArray_uint32().length, data.secondData.length);
    assertEq(data.loadedData.length, data.newSecondDataBytes.length);
    assertEq(data.loadedData, data.newSecondDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(IStore(this).getField(data.table, data.key, 0, schema)), data.firstDataBytes);
    assertEq(IStore(this).getField(data.table, data.key, 2, schema), data.thirdDataBytes);

    // Create data for update
    {
      uint64[] memory _thirdDataForUpdate = new uint64[](4);
      _thirdDataForUpdate[0] = 0x7777777777777777;
      _thirdDataForUpdate[1] = 0x8888888888888888;
      _thirdDataForUpdate[2] = 0x9999999999999999;
      _thirdDataForUpdate[3] = 0x0;
      data.thirdDataForUpdate = EncodeArray.encode(_thirdDataForUpdate);

      data.newThirdDataBytes = abi.encodePacked(
        data.thirdData[0],
        _thirdDataForUpdate[0],
        _thirdDataForUpdate[1],
        _thirdDataForUpdate[2],
        _thirdDataForUpdate[3],
        data.thirdData[5]
      );
    }

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(data.table, data.key, 2, data.newThirdDataBytes);

    // Update indexes 1,2,3,4 in third field (8 = byte length of uint64)
    IStore(this).updateInField(data.table, data.key, 2, 8 * 1, data.thirdDataForUpdate, schema);

    // Get third field
    data.loadedData = IStore(this).getField(data.table, data.key, 2, schema);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(data.loadedData).decodeArray_uint64().length, data.thirdData.length);
    assertEq(data.loadedData.length, data.newThirdDataBytes.length);
    assertEq(data.loadedData, data.newThirdDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(IStore(this).getField(data.table, data.key, 0, schema)), data.firstDataBytes);
    assertEq(IStore(this).getField(data.table, data.key, 1, schema), data.newSecondDataBytes);

    // startByteIndex must not overflow
    vm.expectRevert(
      abi.encodeWithSelector(IStoreErrors.StoreCore_DataIndexOverflow.selector, type(uint40).max, type(uint56).max)
    );
    IStore(this).updateInField(data.table, data.key, 2, type(uint56).max, data.thirdDataForUpdate, schema);
  }

  function testAccessEmptyData() public {
    bytes32 table = keccak256("some.table");
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT32, SchemaType.UINT32_ARRAY);

    IStore(this).registerSchema(table, schema, defaultKeySchema);

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    bytes memory data1 = IStore(this).getRecord(table, key, schema);
    assertEq(data1.length, schema.staticDataLength());

    bytes memory data2 = IStore(this).getField(table, key, 0, schema);
    assertEq(data2.length, schema.staticDataLength());

    bytes memory data3 = IStore(this).getField(table, key, 1, schema);
    assertEq(data3.length, 0);

    uint256 data3Length = IStore(this).getFieldLength(table, key, 1, schema);
    assertEq(data3Length, 0);

    bytes memory data3Slice = IStore(this).getFieldSlice(table, key, 1, schema, 0, 0);
    assertEq(data3Slice.length, 0);
  }

  function testHooks() public {
    bytes32 table = keccak256("some.table");
    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some key");

    // Register table's schema
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT128);
    IStore(this).registerSchema(table, schema, defaultKeySchema);

    // Create subscriber
    MirrorSubscriber subscriber = new MirrorSubscriber(table, schema, defaultKeySchema);

    IStore(this).registerStoreHook(table, subscriber);

    bytes memory data = abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10));

    IStore(this).setRecord(table, key, data, schema);

    // Get data from indexed table - the indexer should have mirrored the data there
    bytes memory indexedData = IStore(this).getRecord(indexerTableId, key, schema);
    assertEq(keccak256(data), keccak256(indexedData));

    data = abi.encodePacked(bytes16(0x1112131415161718191a1b1c1d1e1f20));

    IStore(this).setField(table, key, 0, data, schema);

    // Get data from indexed table - the indexer should have mirrored the data there
    indexedData = IStore(this).getRecord(indexerTableId, key, schema);
    assertEq(keccak256(data), keccak256(indexedData));

    IStore(this).deleteRecord(table, key, schema);

    // Get data from indexed table - the indexer should have mirrored the data there
    indexedData = IStore(this).getRecord(indexerTableId, key, schema);
    assertEq(keccak256(indexedData), keccak256(abi.encodePacked(bytes16(0))));
  }

  function testHooksDynamicData() public {
    bytes32 table = keccak256("some.table");
    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some key");

    // Register table's schema
    Schema schema = SchemaEncodeHelper.encode(SchemaType.UINT128, SchemaType.UINT32_ARRAY);
    IStore(this).registerSchema(table, schema, defaultKeySchema);

    // Create subscriber
    MirrorSubscriber subscriber = new MirrorSubscriber(table, schema, defaultKeySchema);

    IStore(this).registerStoreHook(table, subscriber);

    uint32[] memory arrayData = new uint32[](1);
    arrayData[0] = 0x01020304;
    bytes memory arrayDataBytes = EncodeArray.encode(arrayData);
    PackedCounter encodedArrayDataLength = PackedCounterLib.pack(uint40(arrayDataBytes.length));
    bytes memory dynamicData = abi.encodePacked(encodedArrayDataLength.unwrap(), arrayDataBytes);
    bytes memory staticData = abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10));
    bytes memory data = abi.encodePacked(staticData, dynamicData);

    IStore(this).setRecord(table, key, data, schema);

    // Get data from indexed table - the indexer should have mirrored the data there
    bytes memory indexedData = IStore(this).getRecord(indexerTableId, key, schema);
    assertEq(keccak256(data), keccak256(indexedData));

    // Update dynamic data
    arrayData[0] = 0x11121314;
    arrayDataBytes = EncodeArray.encode(arrayData);
    dynamicData = abi.encodePacked(encodedArrayDataLength.unwrap(), arrayDataBytes);
    data = abi.encodePacked(staticData, dynamicData);

    IStore(this).setField(table, key, 1, arrayDataBytes, schema);

    // Get data from indexed table - the indexer should have mirrored the data there
    indexedData = IStore(this).getRecord(indexerTableId, key, schema);
    assertEq(keccak256(data), keccak256(indexedData));

    IStore(this).deleteRecord(table, key, schema);

    // Get data from indexed table - the indexer should have mirrored the data there
    indexedData = IStore(this).getRecord(indexerTableId, key, schema);
    assertEq(keccak256(indexedData), keccak256(abi.encodePacked(bytes16(0))));
  }
}
