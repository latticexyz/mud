// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { StoreCore, StoreCoreInternal } from "../src/StoreCore.sol";
import { Bytes } from "../src/Bytes.sol";
import { SliceLib } from "../src/Slice.sol";
import { EncodeArray } from "../src/tightcoder/EncodeArray.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { Schema } from "../src/Schema.sol";
import { PackedCounter, PackedCounterLib } from "../src/PackedCounter.sol";
import { StoreMock } from "../test/StoreMock.sol";
import { IStoreErrors } from "../src/IStoreErrors.sol";
import { IStore } from "../src/IStore.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";
import { Tables, TablesTableId } from "../src/codegen/Tables.sol";
import { FieldLayoutEncodeHelper } from "./FieldLayoutEncodeHelper.sol";
import { StoreHookLib } from "../src/StoreHook.sol";
import { SchemaEncodeHelper } from "./SchemaEncodeHelper.sol";
import { StoreMock } from "./StoreMock.sol";
import { MirrorSubscriber, indexerTableId } from "./MirrorSubscriber.sol";
import { RevertSubscriber } from "./RevertSubscriber.sol";
import { EchoSubscriber } from "./EchoSubscriber.sol";

struct TestStruct {
  uint128 firstData;
  uint32[] secondData;
  uint32[] thirdData;
}

contract StoreCoreTest is Test, StoreMock {
  TestStruct private testStruct;
  event HookCalled(bytes);

  mapping(uint256 => bytes) private testMapping;
  Schema defaultKeySchema = SchemaEncodeHelper.encode(SchemaType.BYTES32);
  string[] defaultKeyNames = new string[](1);

  function testRegisterAndGetFieldLayout() public {
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 1, 2, 0);
    Schema keySchema = SchemaEncodeHelper.encode(SchemaType.UINT8, SchemaType.UINT16);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );
    string[] memory keyNames = new string[](2);
    keyNames[0] = "key1";
    keyNames[1] = "key2";
    string[] memory fieldNames = new string[](4);
    fieldNames[0] = "value1";
    fieldNames[1] = "value2";
    fieldNames[2] = "value3";
    fieldNames[3] = "value4";

    bytes32 table = keccak256("some.table");

    // Expect a StoreSetRecord event to be emitted
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32(table);
    vm.expectEmit(true, true, true, true);
    emit StoreSetRecord(
      TablesTableId,
      key,
      Tables.encodeStatic(fieldLayout.unwrap(), keySchema.unwrap(), valueSchema.unwrap()),
      Tables.encodeLengths(abi.encode(keyNames), abi.encode(fieldNames)).unwrap(),
      Tables.encodeDynamic(abi.encode(keyNames), abi.encode(fieldNames))
    );
    IStore(this).registerTable(table, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);

    assertEq(IStore(this).getFieldLayout(table).unwrap(), fieldLayout.unwrap());
    assertEq(IStore(this).getValueSchema(table).unwrap(), valueSchema.unwrap());
    assertEq(IStore(this).getKeySchema(table).unwrap(), keySchema.unwrap());

    bytes memory loadedKeyNames = Tables.getAbiEncodedKeyNames(IStore(this), table);
    assertEq(loadedKeyNames, abi.encode(keyNames));

    bytes memory loadedFieldNames = Tables.getAbiEncodedFieldNames(IStore(this), table);
    assertEq(loadedFieldNames, abi.encode(fieldNames));
  }

  function testFailRegisterInvalidFieldLayout() public {
    string[] memory keyNames = new string[](2);
    string[] memory fieldNames = new string[](4);
    IStore(this).registerTable(
      keccak256("table"),
      FieldLayout.wrap(keccak256("random bytes as value field layout")),
      Schema.wrap(keccak256("random bytes as key schema")),
      Schema.wrap(keccak256("random bytes as schema")),
      keyNames,
      fieldNames
    );
  }

  function testHasFieldLayoutAndSchema() public {
    string[] memory keyNames = new string[](1);
    string[] memory fieldNames = new string[](4);
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 1, 2, 0);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );
    bytes32 table = keccak256("some.table");
    bytes32 table2 = keccak256("other.table");
    IStore(this).registerTable(table, fieldLayout, defaultKeySchema, valueSchema, keyNames, fieldNames);

    assertTrue(StoreCore.hasTable(table));
    assertFalse(StoreCore.hasTable(table2));

    IStore(this).getFieldLayout(table);
    IStore(this).getValueSchema(table);
    IStore(this).getKeySchema(table);

    vm.expectRevert(
      abi.encodeWithSelector(IStoreErrors.StoreCore_TableNotFound.selector, table2, string(abi.encodePacked(table2)))
    );
    IStore(this).getFieldLayout(table2);

    vm.expectRevert(
      abi.encodeWithSelector(IStoreErrors.StoreCore_TableNotFound.selector, table2, string(abi.encodePacked(table2)))
    );
    IStore(this).getValueSchema(table2);

    vm.expectRevert(
      abi.encodeWithSelector(IStoreErrors.StoreCore_TableNotFound.selector, table2, string(abi.encodePacked(table2)))
    );
    IStore(this).getKeySchema(table2);
  }

  function testRegisterTableRevertNames() public {
    bytes32 table = keccak256("some.table");
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 0);
    Schema keySchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT8);
    string[] memory fourNames = new string[](4);
    string[] memory oneName = new string[](1);

    // Register table with invalid key names
    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.StoreCore_InvalidKeyNamesLength.selector, 4, 1));
    IStore(this).registerTable(table, fieldLayout, keySchema, valueSchema, oneName, oneName);

    // Register table with invalid value names
    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.StoreCore_InvalidFieldNamesLength.selector, 1, 4));
    IStore(this).registerTable(table, fieldLayout, keySchema, valueSchema, fourNames, fourNames);
  }

  function testSetAndGetDynamicDataLength() public {
    bytes32 table = keccak256("some.table");

    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 4, 2);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT32,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT32_ARRAY
    );

    // Register table
    IStore(this).registerTable(table, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](5));

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
    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 1, 2, 0);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );

    bytes32 table = keccak256("some.table");
    IStore(this).registerTable(table, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](4));

    // Set data
    bytes memory staticData = abi.encodePacked(bytes1(0x01), bytes2(0x0203), bytes1(0x04), bytes2(0x0506));

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    // Expect a StoreSetRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetRecord(table, key, staticData, bytes32(0), new bytes(0));

    IStore(this).setRecord(table, key, staticData, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout);

    // Get data
    bytes memory loadedData = IStore(this).getRecord(table, key, fieldLayout);

    assertTrue(Bytes.equals(staticData, loadedData));
  }

  function testFailSetAndGetStaticData() public {
    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 1, 2, 0);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );
    bytes32 table = keccak256("some.table");
    IStore(this).registerTable(table, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](4));

    // Set data
    bytes memory staticData = abi.encodePacked(bytes1(0x01), bytes2(0x0203), bytes1(0x04));

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    // This should fail because the data is not 6 bytes long
    IStore(this).setRecord(table, key, staticData, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout);
  }

  function testSetAndGetStaticDataSpanningWords() public {
    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 32, 0);
    bytes32 table = keccak256("some.table");
    {
      Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT128, SchemaType.UINT256);
      IStore(this).registerTable(table, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](2));
    }

    // Set data
    bytes memory staticData = abi.encodePacked(
      bytes16(0x0102030405060708090a0b0c0d0e0f10),
      bytes32(0x1112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30)
    );

    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some.key");

    // Expect a StoreSetRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetRecord(table, key, staticData, bytes32(0), new bytes(0));

    IStore(this).setRecord(table, key, staticData, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout);

    // Get data
    bytes memory loadedData = IStore(this).getRecord(table, key, fieldLayout);

    assertTrue(Bytes.equals(staticData, loadedData));
  }

  function testSetAndGetDynamicData() public {
    bytes32 table = keccak256("some.table");

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 2);
    {
      Schema valueSchema = SchemaEncodeHelper.encode(
        SchemaType.UINT128,
        SchemaType.UINT32_ARRAY,
        SchemaType.UINT32_ARRAY
      );
      IStore(this).registerTable(table, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](3));
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
      encodedDynamicLength = PackedCounterLib.pack(uint40(secondDataBytes.length), uint40(thirdDataBytes.length));
    }

    // Concat data
    bytes memory staticData = abi.encodePacked(firstDataBytes);
    bytes memory dynamicData = abi.encodePacked(secondDataBytes, thirdDataBytes);
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
    emit StoreSetRecord(table, key, staticData, encodedDynamicLength.unwrap(), dynamicData);

    // Set data
    IStore(this).setRecord(table, key, staticData, encodedDynamicLength, dynamicData, fieldLayout);

    // Get data
    bytes memory loadedData = IStore(this).getRecord(table, key, fieldLayout);

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

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 32, 2);
    {
      Schema valueSchema = SchemaEncodeHelper.encode(
        SchemaType.UINT128,
        SchemaType.UINT256,
        SchemaType.UINT32_ARRAY,
        SchemaType.UINT32_ARRAY
      );
      IStore(this).registerTable(table, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](4));
    }

    bytes16 firstDataBytes = bytes16(0x0102030405060708090a0b0c0d0e0f10);

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    bytes memory firstDataPacked = abi.encodePacked(firstDataBytes);

    // Expect a StoreSpliceStaticData event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSpliceStaticData(table, key, 0, uint40(firstDataPacked.length), firstDataPacked);

    // Set first field
    IStore(this).setField(table, key, 0, firstDataPacked, fieldLayout);

    ////////////////
    // Static data
    ////////////////

    // Get first field
    bytes memory loadedData = IStore(this).getField(table, key, 0, fieldLayout);

    // Verify loaded data is correct
    assertEq(loadedData.length, 16);
    assertEq(bytes16(loadedData), bytes16(firstDataBytes));

    // Verify the second index is not set yet
    assertEq(uint256(bytes32(IStore(this).getField(table, key, 1, fieldLayout))), 0);

    // Set second field
    bytes32 secondDataBytes = keccak256("some data");

    bytes memory secondDataPacked = abi.encodePacked(secondDataBytes);

    // Expect a StoreSpliceRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSpliceStaticData(
      table,
      key,
      uint48(firstDataPacked.length),
      uint40(secondDataPacked.length),
      secondDataPacked
    );

    IStore(this).setField(table, key, 1, secondDataPacked, fieldLayout);

    // Get second field
    loadedData = IStore(this).getField(table, key, 1, fieldLayout);

    // Verify loaded data is correct
    assertEq(loadedData.length, 32);
    assertEq(bytes32(loadedData), secondDataBytes);

    // Verify the first field didn't change
    assertEq(bytes16(IStore(this).getField(table, key, 0, fieldLayout)), bytes16(firstDataBytes));

    // Verify the full static data is correct
    assertEq(IStore(this).getFieldLayout(table).staticDataLength(), 48);
    assertEq(IStore(this).getValueSchema(table).staticDataLength(), 48);
    assertEq(Bytes.slice16(IStore(this).getRecord(table, key, fieldLayout), 0), firstDataBytes);
    assertEq(Bytes.slice32(IStore(this).getRecord(table, key, fieldLayout), 16), secondDataBytes);
    assertEq(
      keccak256(SliceLib.getSubslice(IStore(this).getRecord(table, key, fieldLayout), 0, 48).toBytes()),
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

    // Expect a StoreSpliceRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSpliceDynamicData(
      table,
      key,
      uint48(0),
      0,
      thirdDataBytes,
      PackedCounterLib.pack(thirdDataBytes.length, 0).unwrap()
    );

    // Set third field
    IStore(this).setField(table, key, 2, thirdDataBytes, fieldLayout);

    // Get third field
    loadedData = IStore(this).getField(table, key, 2, fieldLayout);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(loadedData).decodeArray_uint32().length, 2);
    assertEq(loadedData.length, thirdDataBytes.length);
    assertEq(keccak256(loadedData), keccak256(thirdDataBytes));

    // Verify the fourth field is not set yet
    assertEq(IStore(this).getField(table, key, 3, fieldLayout).length, 0);

    // Verify none of the previous fields were impacted
    assertEq(bytes16(IStore(this).getField(table, key, 0, fieldLayout)), bytes16(firstDataBytes));
    assertEq(bytes32(IStore(this).getField(table, key, 1, fieldLayout)), bytes32(secondDataBytes));

    // Expect a StoreSpliceRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSpliceDynamicData(
      table,
      key,
      uint48(thirdDataBytes.length),
      0,
      fourthDataBytes,
      PackedCounterLib.pack(thirdDataBytes.length, fourthDataBytes.length).unwrap()
    );

    // Set fourth field
    IStore(this).setField(table, key, 3, fourthDataBytes, fieldLayout);

    // Get fourth field
    loadedData = IStore(this).getField(table, key, 3, fieldLayout);

    // Verify loaded data is correct
    assertEq(loadedData.length, fourthDataBytes.length);
    assertEq(keccak256(loadedData), keccak256(fourthDataBytes));

    // Verify all fields are correct
    PackedCounter encodedLengths = PackedCounterLib.pack(uint40(thirdDataBytes.length), uint40(fourthDataBytes.length));
    assertEq(
      keccak256(IStore(this).getRecord(table, key, fieldLayout)),
      keccak256(
        abi.encodePacked(firstDataBytes, secondDataBytes, encodedLengths.unwrap(), thirdDataBytes, fourthDataBytes)
      )
    );

    // Set fourth field again, changing it to be equal to third field
    // (non-zero deleteCount must be emitted when the array exists)

    // Expect a StoreSpliceRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSpliceDynamicData(
      table,
      key,
      uint48(thirdDataBytes.length),
      uint40(fourthDataBytes.length),
      thirdDataBytes,
      PackedCounterLib.pack(thirdDataBytes.length, thirdDataBytes.length).unwrap()
    );

    // Set fourth field
    IStore(this).setField(table, key, 3, thirdDataBytes, fieldLayout);

    // Get fourth field
    loadedData = IStore(this).getField(table, key, 3, fieldLayout);

    // Verify loaded data is correct
    assertEq(loadedData.length, thirdDataBytes.length);
    assertEq(keccak256(loadedData), keccak256(thirdDataBytes));
  }

  function testDeleteData() public {
    bytes32 table = keccak256("some.table");

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 2);
    {
      Schema valueSchema = SchemaEncodeHelper.encode(
        SchemaType.UINT128,
        SchemaType.UINT32_ARRAY,
        SchemaType.UINT32_ARRAY
      );
      IStore(this).registerTable(table, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](3));
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
      encodedDynamicLength = PackedCounterLib.pack(uint40(secondDataBytes.length), uint40(thirdDataBytes.length));
    }

    // Concat data
    bytes memory staticData = abi.encodePacked(firstDataBytes);
    bytes memory dynamicData = abi.encodePacked(secondDataBytes, thirdDataBytes);
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
    IStore(this).setRecord(table, key, staticData, encodedDynamicLength, dynamicData, fieldLayout);

    // Get data
    bytes memory loadedData = IStore(this).getRecord(table, key, fieldLayout);

    assertEq(loadedData.length, data.length);
    assertEq(keccak256(loadedData), keccak256(data));

    // Expect a StoreDeleteRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreDeleteRecord(table, key);

    // Delete data
    IStore(this).deleteRecord(table, key, fieldLayout);

    // Verify data is deleted
    loadedData = IStore(this).getRecord(table, key, fieldLayout);
    assertEq(keccak256(loadedData), keccak256(new bytes(fieldLayout.staticDataLength())));
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

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(32, 2);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT256,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT32_ARRAY
    );
    IStore(this).registerTable(
      data.table,
      fieldLayout,
      defaultKeySchema,
      valueSchema,
      new string[](1),
      new string[](3)
    );

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
    IStore(this).setField(data.table, data.key, 0, abi.encodePacked(data.firstDataBytes), fieldLayout);
    IStore(this).setField(data.table, data.key, 1, data.secondDataBytes, fieldLayout);
    // Initialize a field with push
    IStore(this).pushToField(data.table, data.key, 2, data.thirdDataBytes, fieldLayout);

    // Create data to push
    {
      uint32[] memory secondData = new uint32[](1);
      secondData[0] = 0x25262728;
      data.secondDataToPush = EncodeArray.encode(secondData);
    }
    data.newSecondDataBytes = abi.encodePacked(data.secondDataBytes, data.secondDataToPush);

    // Expect a StoreSpliceDynamicData event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSpliceDynamicData(
      data.table,
      data.key,
      uint48(data.secondDataBytes.length),
      0,
      data.secondDataToPush,
      PackedCounterLib.pack(data.newSecondDataBytes.length, data.thirdDataBytes.length).unwrap()
    );

    // Push to second field
    IStore(this).pushToField(data.table, data.key, 1, data.secondDataToPush, fieldLayout);

    // Get second field
    data.loadedData = IStore(this).getField(data.table, data.key, 1, fieldLayout);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(data.loadedData).decodeArray_uint32().length, 2 + 1);
    assertEq(data.loadedData.length, data.newSecondDataBytes.length);
    assertEq(data.loadedData, data.newSecondDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(IStore(this).getField(data.table, data.key, 0, fieldLayout)), data.firstDataBytes);
    assertEq(IStore(this).getField(data.table, data.key, 2, fieldLayout), data.thirdDataBytes);

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

    // Expect a StoreSpliceRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSpliceDynamicData(
      data.table,
      data.key,
      uint48(data.newSecondDataBytes.length + data.thirdDataBytes.length),
      0,
      data.thirdDataToPush,
      PackedCounterLib.pack(data.newSecondDataBytes.length, data.newThirdDataBytes.length).unwrap()
    );

    // Push to third field
    IStore(this).pushToField(data.table, data.key, 2, data.thirdDataToPush, fieldLayout);

    // Get third field
    data.loadedData = IStore(this).getField(data.table, data.key, 2, fieldLayout);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(data.loadedData).decodeArray_uint32().length, 3 + 10);
    assertEq(data.loadedData.length, data.newThirdDataBytes.length);
    assertEq(data.loadedData, data.newThirdDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(IStore(this).getField(data.table, data.key, 0, fieldLayout)), data.firstDataBytes);
    assertEq(IStore(this).getField(data.table, data.key, 1, fieldLayout), data.newSecondDataBytes);
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

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(32, 2);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT256,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT64_ARRAY
    );
    IStore(this).registerTable(
      data.table,
      fieldLayout,
      defaultKeySchema,
      valueSchema,
      new string[](1),
      new string[](3)
    );

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
    IStore(this).setField(data.table, data.key, 0, abi.encodePacked(data.firstDataBytes), fieldLayout);
    IStore(this).setField(data.table, data.key, 1, data.secondDataBytes, fieldLayout);
    IStore(this).setField(data.table, data.key, 2, data.thirdDataBytes, fieldLayout);

    // Create data to use for the update
    {
      uint32[] memory _secondDataForUpdate = new uint32[](1);
      _secondDataForUpdate[0] = 0x25262728;
      data.secondDataForUpdate = EncodeArray.encode(_secondDataForUpdate);

      data.newSecondDataBytes = abi.encodePacked(data.secondData[0], _secondDataForUpdate[0]);
    }

    // Expect a StoreSpliceRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSpliceDynamicData(
      data.table,
      data.key,
      uint48(4 * 1),
      4 * 1,
      data.secondDataForUpdate,
      PackedCounterLib.pack(data.newSecondDataBytes.length, data.thirdDataBytes.length).unwrap()
    );

    // Update index 1 in second field (4 = byte length of uint32)
    IStore(this).updateInField(data.table, data.key, 1, 4 * 1, data.secondDataForUpdate, fieldLayout);

    // Get second field
    data.loadedData = IStore(this).getField(data.table, data.key, 1, fieldLayout);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(data.loadedData).decodeArray_uint32().length, data.secondData.length);
    assertEq(data.loadedData.length, data.newSecondDataBytes.length);
    assertEq(data.loadedData, data.newSecondDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(IStore(this).getField(data.table, data.key, 0, fieldLayout)), data.firstDataBytes);
    assertEq(IStore(this).getField(data.table, data.key, 2, fieldLayout), data.thirdDataBytes);

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

    // Expect a StoreSpliceRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSpliceDynamicData(
      data.table,
      data.key,
      uint48(data.newSecondDataBytes.length + 8 * 1),
      8 * 4,
      data.thirdDataForUpdate,
      PackedCounterLib.pack(data.newSecondDataBytes.length, data.newThirdDataBytes.length).unwrap()
    );

    // Update indexes 1,2,3,4 in third field (8 = byte length of uint64)
    IStore(this).updateInField(data.table, data.key, 2, 8 * 1, data.thirdDataForUpdate, fieldLayout);

    // Get third field
    data.loadedData = IStore(this).getField(data.table, data.key, 2, fieldLayout);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(data.loadedData).decodeArray_uint64().length, data.thirdData.length);
    assertEq(data.loadedData.length, data.newThirdDataBytes.length);
    assertEq(data.loadedData, data.newThirdDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(IStore(this).getField(data.table, data.key, 0, fieldLayout)), data.firstDataBytes);
    assertEq(IStore(this).getField(data.table, data.key, 1, fieldLayout), data.newSecondDataBytes);

    // startByteIndex must not overflow
    vm.expectRevert(
      abi.encodeWithSelector(IStoreErrors.StoreCore_DataIndexOverflow.selector, type(uint40).max, type(uint56).max)
    );
    IStore(this).updateInField(data.table, data.key, 2, type(uint56).max, data.thirdDataForUpdate, fieldLayout);
  }

  function testAccessEmptyData() public {
    bytes32 table = keccak256("some.table");
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(4, 1);
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT32, SchemaType.UINT32_ARRAY);

    IStore(this).registerTable(table, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](2));

    // Create key
    bytes32[] memory key = new bytes32[](1);
    key[0] = bytes32("some.key");

    bytes memory data1 = IStore(this).getRecord(table, key, fieldLayout);
    assertEq(data1.length, fieldLayout.staticDataLength());

    bytes memory data2 = IStore(this).getField(table, key, 0, fieldLayout);
    assertEq(data2.length, fieldLayout.staticDataLength());

    bytes memory data3 = IStore(this).getField(table, key, 1, fieldLayout);
    assertEq(data3.length, 0);

    uint256 data3Length = IStore(this).getFieldLength(table, key, 1, fieldLayout);
    assertEq(data3Length, 0);

    bytes memory data3Slice = IStore(this).getFieldSlice(table, key, 1, fieldLayout, 0, 0);
    assertEq(data3Slice.length, 0);
  }

  function testRegisterHook() public {
    bytes32 table = keccak256("some.table");
    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some key");

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 0);
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT128);
    IStore(this).registerTable(table, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Create subscriber
    MirrorSubscriber subscriber = new MirrorSubscriber(
      table,
      fieldLayout,
      defaultKeySchema,
      valueSchema,
      new string[](1),
      new string[](1)
    );

    IStore(this).registerStoreHook(
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

    bytes memory staticData = abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10));

    IStore(this).setRecord(table, key, staticData, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout);

    // Get data from indexed table - the indexer should have mirrored the data there
    bytes memory indexedData = IStore(this).getRecord(indexerTableId, key, fieldLayout);
    assertEq(keccak256(staticData), keccak256(indexedData));

    staticData = abi.encodePacked(bytes16(0x1112131415161718191a1b1c1d1e1f20));

    IStore(this).setField(table, key, 0, staticData, fieldLayout);

    // Get data from indexed table - the indexer should have mirrored the data there
    indexedData = IStore(this).getRecord(indexerTableId, key, fieldLayout);
    assertEq(keccak256(staticData), keccak256(indexedData));

    IStore(this).deleteRecord(table, key, fieldLayout);

    // Get data from indexed table - the indexer should have mirrored the data there
    indexedData = IStore(this).getRecord(indexerTableId, key, fieldLayout);
    assertEq(keccak256(indexedData), keccak256(abi.encodePacked(bytes16(0))));
  }

  function testUnregisterHook() public {
    bytes32 table = keccak256("some.table");
    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some key");

    // Register table's schema
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 0);
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT128);
    IStore(this).registerTable(table, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Create a RevertSubscriber and an EchoSubscriber
    RevertSubscriber revertSubscriber = new RevertSubscriber();
    EchoSubscriber echoSubscriber = new EchoSubscriber();

    // Register both subscribers
    IStore(this).registerStoreHook(
      table,
      revertSubscriber,
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: true,
        onAfterSetRecord: true,
        onBeforeSetField: true,
        onAfterSetField: true,
        onBeforeDeleteRecord: true,
        onAfterDeleteRecord: true
      })
    );
    // Register both subscribers
    IStore(this).registerStoreHook(
      table,
      echoSubscriber,
      StoreHookLib.encodeBitmap({
        onBeforeSetRecord: true,
        onAfterSetRecord: true,
        onBeforeSetField: true,
        onAfterSetField: true,
        onBeforeDeleteRecord: true,
        onAfterDeleteRecord: true
      })
    );

    bytes memory data = abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10));

    // Expect a revert when the RevertSubscriber's onBeforeSetRecord hook is called
    vm.expectRevert(bytes("onBeforeSetRecord"));
    IStore(this).setRecord(table, key, data, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout);

    // Expect a revert when the RevertSubscriber's onBeforeSetField hook is called
    vm.expectRevert(bytes("onBeforeSetField"));
    IStore(this).setField(table, key, 0, data, fieldLayout);

    // Expect a revert when the RevertSubscriber's onBeforeDeleteRecord hook is called
    vm.expectRevert(bytes("onBeforeDeleteRecord"));
    IStore(this).deleteRecord(table, key, fieldLayout);

    // Unregister the RevertSubscriber
    IStore(this).unregisterStoreHook(table, revertSubscriber);

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onBeforeSetRecord hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(table, key, data, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout));

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onAfterSetRecord hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(table, key, data, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout));

    IStore(this).setRecord(table, key, data, PackedCounter.wrap(bytes32(0)), new bytes(0), fieldLayout);

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onBeforeSetField hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(table, key, uint8(0), data, fieldLayout));

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onAfterSetField hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(table, key, uint8(0), data, fieldLayout));

    IStore(this).setField(table, key, 0, data, fieldLayout);

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onBeforeDeleteRecord hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(table, key, fieldLayout));

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onAfterDeleteRecord hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encode(table, key, fieldLayout));

    IStore(this).deleteRecord(table, key, fieldLayout);
  }

  function testHooksDynamicData() public {
    bytes32 table = keccak256("some.table");
    bytes32[] memory key = new bytes32[](1);
    key[0] = keccak256("some key");

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 1);
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT128, SchemaType.UINT32_ARRAY);
    IStore(this).registerTable(table, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](2));

    // Create subscriber
    MirrorSubscriber subscriber = new MirrorSubscriber(
      table,
      fieldLayout,
      defaultKeySchema,
      valueSchema,
      new string[](1),
      new string[](2)
    );

    IStore(this).registerStoreHook(
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

    uint32[] memory arrayData = new uint32[](1);
    arrayData[0] = 0x01020304;
    bytes memory arrayDataBytes = EncodeArray.encode(arrayData);
    PackedCounter encodedArrayDataLength = PackedCounterLib.pack(uint40(arrayDataBytes.length));
    bytes memory dynamicData = arrayDataBytes;
    bytes memory staticData = abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10));
    bytes memory data = abi.encodePacked(staticData, encodedArrayDataLength, dynamicData);

    IStore(this).setRecord(table, key, staticData, encodedArrayDataLength, dynamicData, fieldLayout);

    // Get data from indexed table - the indexer should have mirrored the data there
    bytes memory indexedData = IStore(this).getRecord(indexerTableId, key, fieldLayout);
    assertEq(keccak256(data), keccak256(indexedData));

    // Update dynamic data
    arrayData[0] = 0x11121314;
    arrayDataBytes = EncodeArray.encode(arrayData);
    dynamicData = arrayDataBytes;
    data = abi.encodePacked(staticData, encodedArrayDataLength, dynamicData);

    IStore(this).setField(table, key, 1, arrayDataBytes, fieldLayout);

    // Get data from indexed table - the indexer should have mirrored the data there
    indexedData = IStore(this).getRecord(indexerTableId, key, fieldLayout);
    assertEq(keccak256(data), keccak256(indexedData));

    IStore(this).deleteRecord(table, key, fieldLayout);

    // Get data from indexed table - the indexer should have mirrored the data there
    indexedData = IStore(this).getRecord(indexerTableId, key, fieldLayout);
    assertEq(keccak256(indexedData), keccak256(abi.encodePacked(bytes16(0))));
  }
}
