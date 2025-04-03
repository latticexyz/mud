// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { StoreCore, StoreCoreInternal } from "../src/StoreCore.sol";
import { Bytes } from "../src/Bytes.sol";
import { SliceLib } from "../src/Slice.sol";
import { EncodeArray } from "../src/tightcoder/EncodeArray.sol";
import { FieldLayout, FieldLayoutLib } from "../src/FieldLayout.sol";
import { Schema } from "../src/Schema.sol";
import { EncodedLengths, EncodedLengthsLib } from "../src/EncodedLengths.sol";
import { StoreMock } from "../test/StoreMock.sol";
import { IStoreErrors } from "../src/IStoreErrors.sol";
import { IStore } from "../src/IStore.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";
import { IStoreHook } from "../src/IStoreHook.sol";
import { Tables, ResourceIds } from "../src/codegen/index.sol";
import { ResourceId, ResourceIdLib } from "../src/ResourceId.sol";
import { RESOURCE_TABLE, RESOURCE_OFFCHAIN_TABLE } from "../src/storeResourceTypes.sol";
import { FieldLayoutEncodeHelper } from "./FieldLayoutEncodeHelper.sol";
import { BEFORE_SET_RECORD, AFTER_SET_RECORD, BEFORE_SPLICE_STATIC_DATA, AFTER_SPLICE_STATIC_DATA, BEFORE_SPLICE_DYNAMIC_DATA, AFTER_SPLICE_DYNAMIC_DATA, BEFORE_DELETE_RECORD, AFTER_DELETE_RECORD, ALL, BEFORE_ALL, AFTER_ALL } from "../src/storeHookTypes.sol";
import { SchemaEncodeHelper } from "./SchemaEncodeHelper.sol";
import { StoreMock } from "./StoreMock.sol";
import { MirrorSubscriber, indexerTableId } from "./MirrorSubscriber.sol";
import { RevertSubscriber } from "./RevertSubscriber.sol";
import { EchoSubscriber } from "./EchoSubscriber.sol";
import { setDynamicDataLengthAtIndex } from "./setDynamicDataLengthAtIndex.sol";
import { IFieldLayoutErrors } from "../src/IFieldLayoutErrors.sol";

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
  ResourceId _tableId = ResourceIdLib.encode({ typeId: RESOURCE_TABLE, name: "some table" });
  ResourceId _tableId2 = ResourceIdLib.encode({ typeId: RESOURCE_TABLE, name: "some other table" });
  ResourceId _tableId3 = ResourceIdLib.encode({ typeId: RESOURCE_OFFCHAIN_TABLE, name: "some offchain table" });

  function testGetStaticDataLocation() public {
    ResourceId tableId = _tableId;
    bytes32 key = "some key";
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = key;

    // Expect the two methods to return the same value
    assertEq(
      StoreCoreInternal._getStaticDataLocation(tableId, keyTuple),
      StoreCoreInternal._getStaticDataLocation(tableId, key)
    );
  }

  function testRegisterTable() public {
    ResourceId tableId = _tableId;

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

    // Expect a Store_SetRecord event to be emitted
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = ResourceId.unwrap(tableId);
    vm.expectEmit(true, true, true, true);
    emit Store_SetRecord(
      Tables._tableId,
      keyTuple,
      Tables.encodeStatic(fieldLayout, keySchema, valueSchema),
      Tables.encodeLengths(abi.encode(keyNames), abi.encode(fieldNames)),
      Tables.encodeDynamic(abi.encode(keyNames), abi.encode(fieldNames))
    );
    this.registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);

    assertEq(this.getFieldLayout(tableId).unwrap(), fieldLayout.unwrap());
    assertEq(this.getValueSchema(tableId).unwrap(), valueSchema.unwrap());
    assertEq(this.getKeySchema(tableId).unwrap(), keySchema.unwrap());

    bytes memory loadedKeyNames = Tables.getAbiEncodedKeyNames(tableId);
    assertEq(loadedKeyNames, abi.encode(keyNames));

    bytes memory loadedFieldNames = Tables.getAbiEncodedFieldNames(tableId);
    assertEq(loadedFieldNames, abi.encode(fieldNames));

    // Expect the table ID to be registered
    assertTrue(ResourceIds._getExists(tableId));
  }

  function testRevertTableExists() public {
    ResourceId tableId = _tableId;
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 0);
    Schema keySchema = SchemaEncodeHelper.encode(SchemaType.UINT8);
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT8);
    string[] memory keyNames = new string[](1);
    string[] memory fieldNames = new string[](1);

    this.registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);

    // Expect a revert when registering a table that already exists
    vm.expectRevert(
      abi.encodeWithSelector(IStoreErrors.Store_TableAlreadyExists.selector, tableId, string(abi.encodePacked(tableId)))
    );
    this.registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
  }

  function testRevertRegisterInvalidFieldLayout() public {
    ResourceId tableId = _tableId;

    string[] memory keyNames = new string[](2);
    string[] memory fieldNames = new string[](4);
    FieldLayout invalidFieldLayout = FieldLayout.wrap(keccak256("random bytes as value field layout"));

    vm.expectRevert(
      abi.encodeWithSelector(
        IFieldLayoutErrors.FieldLayout_TooManyDynamicFields.selector,
        invalidFieldLayout.numDynamicFields(),
        5
      )
    );
    this.registerTable(
      tableId,
      FieldLayout.wrap(keccak256("random bytes as value field layout")),
      Schema.wrap(keccak256("random bytes as key schema")),
      Schema.wrap(keccak256("random bytes as value schema")),
      keyNames,
      fieldNames
    );
  }

  function testRevertRegisterInvalidTableId() public {
    bytes2 invalidType = "xx";
    ResourceId invalidTableId = ResourceIdLib.encode({ typeId: invalidType, name: "somename" });

    vm.expectRevert(
      abi.encodeWithSelector(
        IStoreErrors.Store_InvalidResourceType.selector,
        RESOURCE_TABLE,
        invalidTableId,
        string(abi.encodePacked(invalidTableId))
      )
    );
    this.registerTable(
      invalidTableId,
      FieldLayoutEncodeHelper.encode(1, 0),
      SchemaEncodeHelper.encode(SchemaType.UINT8),
      SchemaEncodeHelper.encode(SchemaType.UINT8),
      new string[](1),
      new string[](1)
    );
  }

  function testHasFieldLayoutAndSchema() public {
    ResourceId tableId = _tableId;
    ResourceId tableId2 = _tableId2;

    string[] memory keyNames = new string[](1);
    string[] memory fieldNames = new string[](4);
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 1, 2, 0);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );
    this.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, keyNames, fieldNames);

    assertTrue(ResourceIds._getExists(tableId));
    assertFalse(ResourceIds._getExists(tableId2));

    assertEq(FieldLayout.unwrap(this.getFieldLayout(tableId)), FieldLayout.unwrap(fieldLayout));
    assertEq(Schema.unwrap(this.getValueSchema(tableId)), Schema.unwrap(valueSchema));
    assertEq(Schema.unwrap(this.getKeySchema(tableId)), Schema.unwrap(defaultKeySchema));

    assertTrue(this.getFieldLayout(tableId2).isEmpty());

    vm.expectRevert(
      abi.encodeWithSelector(IStoreErrors.Store_TableNotFound.selector, tableId2, string(abi.encodePacked(tableId2)))
    );
    this.getValueSchema(tableId2);

    vm.expectRevert(
      abi.encodeWithSelector(IStoreErrors.Store_TableNotFound.selector, tableId2, string(abi.encodePacked(tableId2)))
    );
    this.getKeySchema(tableId2);
  }

  function testRegisterTableRevertNames() public {
    ResourceId tableId = _tableId;

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
    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.Store_InvalidKeyNamesLength.selector, 4, 1));
    this.registerTable(tableId, fieldLayout, keySchema, valueSchema, oneName, oneName);

    // Register table with invalid value names
    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.Store_InvalidFieldNamesLength.selector, 1, 4));
    this.registerTable(tableId, fieldLayout, keySchema, valueSchema, fourNames, fourNames);
  }

  function testSetAndGetDynamicDataLength() public {
    ResourceId tableId = _tableId;

    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 4, 2);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT32,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT32_ARRAY
    );

    // Register table
    this.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](5));

    // Create some keyTuple
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = bytes32("some key");

    // Set dynamic data length of dynamic index 0
    setDynamicDataLengthAtIndex(tableId, keyTuple, 0, 10);

    EncodedLengths encodedLength = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);
    assertEq(encodedLength.atIndex(0), 10);
    assertEq(encodedLength.atIndex(1), 0);
    assertEq(encodedLength.total(), 10);

    // Set dynamic data length of dynamic index 1
    setDynamicDataLengthAtIndex(tableId, keyTuple, 1, 99);

    encodedLength = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);
    assertEq(encodedLength.atIndex(0), 10);
    assertEq(encodedLength.atIndex(1), 99);
    assertEq(encodedLength.total(), 109);

    // Reduce dynamic data length of dynamic index 0 again
    setDynamicDataLengthAtIndex(tableId, keyTuple, 0, 5);

    encodedLength = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);
    assertEq(encodedLength.atIndex(0), 5);
    assertEq(encodedLength.atIndex(1), 99);
    assertEq(encodedLength.total(), 104);
  }

  function testSetAndGetStaticData() public {
    ResourceId tableId = _tableId;

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 1, 2, 0);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );

    this.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](4));

    // Set data
    bytes memory staticData = abi.encodePacked(bytes1(0x01), bytes2(0x0203), bytes1(0x04), bytes2(0x0506));

    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = "some key";

    // Expect a Store_SetRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SetRecord(tableId, keyTuple, staticData, EncodedLengths.wrap(bytes32(0)), new bytes(0));

    this.setRecord(tableId, keyTuple, staticData, EncodedLengths.wrap(bytes32(0)), new bytes(0));

    // Get data
    (bytes memory loadedStaticData, EncodedLengths _encodedLengths, bytes memory _dynamicData) = this.getRecord(
      tableId,
      keyTuple,
      fieldLayout
    );

    assertEq(staticData, loadedStaticData);
    assertEq(_encodedLengths.unwrap(), bytes32(0));
    assertEq(_dynamicData, "");
  }

  function testSetAndGetStaticDataSpanningWords() public {
    ResourceId tableId = _tableId;

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 32, 0);
    {
      Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT128, SchemaType.UINT256);
      this.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](2));
    }

    // Set data
    bytes memory staticData = abi.encodePacked(
      bytes16(0x0102030405060708090a0b0c0d0e0f10),
      bytes32(0x1112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30)
    );

    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = "some key";

    // Expect a Store_SetRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SetRecord(tableId, keyTuple, staticData, EncodedLengths.wrap(bytes32(0)), new bytes(0));

    this.setRecord(tableId, keyTuple, staticData, EncodedLengths.wrap(bytes32(0)), new bytes(0));

    // Get data
    (bytes memory loadedStaticData, EncodedLengths _encodedLengths, bytes memory _dynamicData) = this.getRecord(
      tableId,
      keyTuple,
      fieldLayout
    );

    assertEq(staticData, loadedStaticData);
    assertEq(_encodedLengths.unwrap(), bytes32(0));
    assertEq(_dynamicData, "");
  }

  function testSetAndGetDynamicData() public {
    ResourceId tableId = _tableId;

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 2);
    {
      Schema valueSchema = SchemaEncodeHelper.encode(
        SchemaType.UINT128,
        SchemaType.UINT32_ARRAY,
        SchemaType.UINT32_ARRAY
      );
      this.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](3));
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

    EncodedLengths encodedDynamicLength;
    {
      encodedDynamicLength = EncodedLengthsLib.pack(uint40(secondDataBytes.length), uint40(thirdDataBytes.length));
    }

    // Concat data
    bytes memory staticData = abi.encodePacked(firstDataBytes);
    bytes memory dynamicData = abi.encodePacked(secondDataBytes, thirdDataBytes);

    // Create keyTuple
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = bytes32("some key");

    // Expect a Store_SetRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SetRecord(tableId, keyTuple, staticData, encodedDynamicLength, dynamicData);

    // Set data
    this.setRecord(tableId, keyTuple, staticData, encodedDynamicLength, dynamicData);

    // Get data
    (bytes memory loadedStaticData, EncodedLengths loadedEncodedLengths, bytes memory loadedDynamicData) = this
      .getRecord(tableId, keyTuple, fieldLayout);

    assertEq(loadedStaticData, staticData);
    assertEq(loadedEncodedLengths.unwrap(), encodedDynamicLength.unwrap());
    assertEq(loadedDynamicData, dynamicData);

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

  struct SetAndGetData {
    ResourceId tableId;
    FieldLayout fieldLayout;
    bytes16 firstDataBytes;
    bytes firstDataPacked;
    bytes32 secondDataBytes;
    bytes secondDataPacked;
    bytes thirdDataBytes;
    bytes fourthDataBytes;
  }

  function testSetAndGetField() public {
    ResourceId tableId = _tableId;

    SetAndGetData memory _data;
    _data.tableId = tableId;

    // Register table
    _data.fieldLayout = FieldLayoutEncodeHelper.encode(16, 32, 2);
    {
      Schema valueSchema = SchemaEncodeHelper.encode(
        SchemaType.UINT128,
        SchemaType.UINT256,
        SchemaType.UINT32_ARRAY,
        SchemaType.UINT32_ARRAY
      );
      this.registerTable(
        _data.tableId,
        _data.fieldLayout,
        defaultKeySchema,
        valueSchema,
        new string[](1),
        new string[](4)
      );
    }

    ////////////////
    // Static data
    ////////////////

    _data.firstDataBytes = bytes16(0x0102030405060708090a0b0c0d0e0f10);

    // Create keyTuple
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = bytes32("some key");

    _data.firstDataPacked = abi.encodePacked(_data.firstDataBytes);

    // Expect a Store_SpliceStaticData event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SpliceStaticData(_data.tableId, keyTuple, 0, _data.firstDataPacked);

    // Set first field
    this.setField(_data.tableId, keyTuple, 0, _data.firstDataPacked, _data.fieldLayout);

    // Get first field
    bytes memory loadedData = this.getField(_data.tableId, keyTuple, 0, _data.fieldLayout);

    // Verify loaded data is correct
    assertEq(loadedData.length, 16);
    assertEq(bytes16(loadedData), bytes16(_data.firstDataBytes));

    // Verify the second index is not set yet
    assertEq(uint256(bytes32(this.getField(_data.tableId, keyTuple, 1, _data.fieldLayout))), 0);

    // Set second field
    _data.secondDataBytes = keccak256("some data");

    _data.secondDataPacked = abi.encodePacked(_data.secondDataBytes);

    // Expect a StoreSpliceRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SpliceStaticData(_data.tableId, keyTuple, uint48(_data.firstDataPacked.length), _data.secondDataPacked);

    this.setField(_data.tableId, keyTuple, 1, _data.secondDataPacked, _data.fieldLayout);

    // Get second field
    loadedData = this.getField(_data.tableId, keyTuple, 1, _data.fieldLayout);

    // Verify loaded data is correct
    assertEq(loadedData.length, 32);
    assertEq(bytes32(loadedData), _data.secondDataBytes);

    // Verify the first field didn't change
    assertEq(bytes16(this.getField(_data.tableId, keyTuple, 0, _data.fieldLayout)), bytes16(_data.firstDataBytes));

    // Verify the full static data is correct
    (bytes memory loadedStaticData, EncodedLengths loadedEncodedLengths, bytes memory loadedDynamicData) = this
      .getRecord(_data.tableId, keyTuple, _data.fieldLayout);
    assertEq(this.getFieldLayout(_data.tableId).staticDataLength(), 48);
    assertEq(this.getValueSchema(_data.tableId).staticDataLength(), 48);
    assertEq(Bytes.getBytes16(loadedStaticData, 0), _data.firstDataBytes);
    assertEq(Bytes.getBytes32(loadedStaticData, 16), _data.secondDataBytes);
    assertEq(
      keccak256(SliceLib.getSubslice(loadedStaticData, 0, 48).toBytes()),
      keccak256(abi.encodePacked(_data.firstDataBytes, _data.secondDataBytes))
    );

    ////////////////
    // Dynamic data
    ////////////////

    {
      uint32[] memory thirdData = new uint32[](2);
      thirdData[0] = 0x11121314;
      thirdData[1] = 0x15161718;
      _data.thirdDataBytes = EncodeArray.encode(thirdData);
    }

    {
      uint32[] memory fourthData = new uint32[](3);
      fourthData[0] = 0x191a1b1c;
      fourthData[1] = 0x1d1e1f20;
      fourthData[2] = 0x21222324;
      _data.fourthDataBytes = EncodeArray.encode(fourthData);
    }

    // Expect a Store_SpliceDynamicData event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SpliceDynamicData(
      _data.tableId,
      keyTuple,
      0,
      0,
      0,
      EncodedLengthsLib.pack(_data.thirdDataBytes.length, 0),
      _data.thirdDataBytes
    );

    // Set third field
    this.setField(_data.tableId, keyTuple, 2, _data.thirdDataBytes, _data.fieldLayout);

    // Get third field
    loadedData = this.getField(_data.tableId, keyTuple, 2, _data.fieldLayout);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(loadedData).decodeArray_uint32().length, 2);
    assertEq(loadedData.length, _data.thirdDataBytes.length);
    assertEq(keccak256(loadedData), keccak256(_data.thirdDataBytes));

    // Verify the fourth field is not set yet
    assertEq(this.getField(_data.tableId, keyTuple, 3, _data.fieldLayout).length, 0);

    // Verify none of the previous fields were impacted
    assertEq(bytes16(this.getField(_data.tableId, keyTuple, 0, _data.fieldLayout)), bytes16(_data.firstDataBytes));
    assertEq(bytes32(this.getField(_data.tableId, keyTuple, 1, _data.fieldLayout)), bytes32(_data.secondDataBytes));

    // Expect a StoreSpliceRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SpliceDynamicData(
      _data.tableId,
      keyTuple,
      1,
      uint48(_data.thirdDataBytes.length),
      0,
      EncodedLengthsLib.pack(_data.thirdDataBytes.length, _data.fourthDataBytes.length),
      _data.fourthDataBytes
    );

    // Set fourth field
    this.setField(_data.tableId, keyTuple, 3, _data.fourthDataBytes, _data.fieldLayout);

    // Get fourth field
    loadedData = this.getField(_data.tableId, keyTuple, 3, _data.fieldLayout);

    // Verify loaded data is correct
    assertEq(loadedData.length, _data.fourthDataBytes.length);
    assertEq(keccak256(loadedData), keccak256(_data.fourthDataBytes));

    // Verify all fields are correct
    EncodedLengths encodedLengths = EncodedLengthsLib.pack(
      uint40(_data.thirdDataBytes.length),
      uint40(_data.fourthDataBytes.length)
    );
    (loadedStaticData, loadedEncodedLengths, loadedDynamicData) = this.getRecord(
      _data.tableId,
      keyTuple,
      _data.fieldLayout
    );
    assertEq(
      abi.encodePacked(loadedStaticData, loadedEncodedLengths, loadedDynamicData),
      abi.encodePacked(
        _data.firstDataBytes,
        _data.secondDataBytes,
        encodedLengths.unwrap(),
        _data.thirdDataBytes,
        _data.fourthDataBytes
      )
    );

    // Set fourth field again, changing it to be equal to third field
    // (non-zero deleteCount must be emitted when the array exists)

    // Expect a StoreSpliceRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SpliceDynamicData(
      _data.tableId,
      keyTuple,
      1,
      uint48(_data.thirdDataBytes.length),
      uint40(_data.fourthDataBytes.length),
      EncodedLengthsLib.pack(_data.thirdDataBytes.length, _data.thirdDataBytes.length),
      _data.thirdDataBytes
    );

    // Set fourth field
    this.setField(_data.tableId, keyTuple, 3, _data.thirdDataBytes, _data.fieldLayout);

    // Get fourth field
    loadedData = this.getField(_data.tableId, keyTuple, 3, _data.fieldLayout);

    // Verify loaded data is correct
    assertEq(loadedData.length, _data.thirdDataBytes.length);
    assertEq(keccak256(loadedData), keccak256(_data.thirdDataBytes));
  }

  function testDeleteData() public {
    ResourceId tableId = _tableId;

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 2);
    {
      Schema valueSchema = SchemaEncodeHelper.encode(
        SchemaType.UINT128,
        SchemaType.UINT32_ARRAY,
        SchemaType.UINT32_ARRAY
      );
      this.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](3));
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

    EncodedLengths encodedDynamicLength;
    {
      encodedDynamicLength = EncodedLengthsLib.pack(uint40(secondDataBytes.length), uint40(thirdDataBytes.length));
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

    // Create keyTuple
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = bytes32("some key");

    // Set data
    this.setRecord(tableId, keyTuple, staticData, encodedDynamicLength, dynamicData);

    // Get data
    (bytes memory loadedStaticData, EncodedLengths loadedEncodedLengths, bytes memory loadedDynamicData) = this
      .getRecord(tableId, keyTuple, fieldLayout);

    assertEq(abi.encodePacked(loadedStaticData, loadedEncodedLengths, loadedDynamicData), data);

    // Expect a Store_DeleteRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_DeleteRecord(tableId, keyTuple);

    // Delete data
    this.deleteRecord(tableId, keyTuple);

    // Verify data is deleted
    (loadedStaticData, loadedEncodedLengths, loadedDynamicData) = this.getRecord(tableId, keyTuple, fieldLayout);
    assertEq(loadedStaticData, new bytes(fieldLayout.staticDataLength()));
    assertEq(loadedEncodedLengths.unwrap(), bytes32(0));
    assertEq(loadedDynamicData, "");
  }

  struct TestPushToDynamicFieldData {
    ResourceId tableId;
    bytes32[] keyTuple;
    bytes32 firstDataBytes;
    bytes secondDataBytes;
    bytes thirdDataBytes;
    bytes secondDataToPush;
    bytes newSecondDataBytes;
    bytes loadedData;
    bytes thirdDataToPush;
    bytes newThirdDataBytes;
  }

  function testPushToDynamicField() public {
    ResourceId tableId = _tableId;

    TestPushToDynamicFieldData memory data = TestPushToDynamicFieldData(
      tableId,
      new bytes32[](0),
      0,
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    );

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(32, 2);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT256,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT32_ARRAY
    );
    this.registerTable(data.tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](3));

    // Create keyTuple
    data.keyTuple = new bytes32[](1);
    data.keyTuple[0] = bytes32("some key");

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
    this.setField(data.tableId, data.keyTuple, 0, abi.encodePacked(data.firstDataBytes), fieldLayout);
    this.setField(data.tableId, data.keyTuple, 1, data.secondDataBytes, fieldLayout);
    // Initialize a field with push
    this.pushToDynamicField(data.tableId, data.keyTuple, 1, data.thirdDataBytes);

    // Create data to push
    {
      uint32[] memory secondData = new uint32[](1);
      secondData[0] = 0x25262728;
      data.secondDataToPush = EncodeArray.encode(secondData);
    }
    data.newSecondDataBytes = abi.encodePacked(data.secondDataBytes, data.secondDataToPush);

    // Expect a Store_SpliceDynamicData event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SpliceDynamicData(
      data.tableId,
      data.keyTuple,
      0,
      uint48(data.secondDataBytes.length),
      0,
      EncodedLengthsLib.pack(data.newSecondDataBytes.length, data.thirdDataBytes.length),
      data.secondDataToPush
    );

    // Push to second field
    this.pushToDynamicField(data.tableId, data.keyTuple, 0, data.secondDataToPush);

    // Get second field
    data.loadedData = this.getField(data.tableId, data.keyTuple, 1, fieldLayout);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(data.loadedData).decodeArray_uint32().length, 2 + 1, "1");
    assertEq(data.loadedData.length, data.newSecondDataBytes.length, "2");
    assertEq(data.loadedData, data.newSecondDataBytes, "3");

    // Verify none of the other fields were impacted
    assertEq(bytes32(this.getField(data.tableId, data.keyTuple, 0, fieldLayout)), data.firstDataBytes, "4");
    assertEq(this.getField(data.tableId, data.keyTuple, 2, fieldLayout), data.thirdDataBytes, "5");

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
    emit Store_SpliceDynamicData(
      data.tableId,
      data.keyTuple,
      1,
      uint48(data.newSecondDataBytes.length + data.thirdDataBytes.length),
      0,
      EncodedLengthsLib.pack(data.newSecondDataBytes.length, data.newThirdDataBytes.length),
      data.thirdDataToPush
    );

    // Push to third field
    this.pushToDynamicField(data.tableId, data.keyTuple, 1, data.thirdDataToPush);

    // Get third field
    data.loadedData = this.getField(data.tableId, data.keyTuple, 2, fieldLayout);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(data.loadedData).decodeArray_uint32().length, 3 + 10, "6");
    assertEq(data.loadedData.length, data.newThirdDataBytes.length, "7");
    assertEq(data.loadedData, data.newThirdDataBytes, "8");

    // Verify none of the other fields were impacted
    assertEq(bytes32(this.getField(data.tableId, data.keyTuple, 0, fieldLayout)), data.firstDataBytes, "9");
    assertEq(this.getField(data.tableId, data.keyTuple, 1, fieldLayout), data.newSecondDataBytes, "10");
  }

  struct TestSpliceDynamicDataData {
    ResourceId tableId;
    bytes32[] keyTuple;
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

  function testSpliceDynamicData() public {
    ResourceId tableId = _tableId;

    TestSpliceDynamicDataData memory data = TestSpliceDynamicDataData(
      tableId,
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

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(32, 2);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT256,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT64_ARRAY
    );
    this.registerTable(data.tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](3));

    // Create keyTuple
    data.keyTuple = new bytes32[](1);
    data.keyTuple[0] = bytes32("some key");

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
    this.setField(data.tableId, data.keyTuple, 0, abi.encodePacked(data.firstDataBytes), fieldLayout);
    this.setField(data.tableId, data.keyTuple, 1, data.secondDataBytes, fieldLayout);
    this.setField(data.tableId, data.keyTuple, 2, data.thirdDataBytes, fieldLayout);

    // Create data to use for the update
    {
      uint32[] memory _secondDataForUpdate = new uint32[](1);
      _secondDataForUpdate[0] = 0x25262728;
      data.secondDataForUpdate = EncodeArray.encode(_secondDataForUpdate);

      data.newSecondDataBytes = abi.encodePacked(data.secondData[0], _secondDataForUpdate[0]);
    }

    // Expect a Store_SpliceDynamicData event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SpliceDynamicData(
      data.tableId,
      data.keyTuple,
      0,
      4 * 1,
      4 * 1,
      EncodedLengthsLib.pack(data.newSecondDataBytes.length, data.thirdDataBytes.length),
      data.secondDataForUpdate
    );

    // Update index 1 in second field (4 = byte length of uint32)
    this.spliceDynamicData(
      data.tableId,
      data.keyTuple,
      0,
      uint40(4 * 1),
      uint40(data.secondDataForUpdate.length),
      data.secondDataForUpdate
    );

    // Get second field
    data.loadedData = this.getField(data.tableId, data.keyTuple, 1, fieldLayout);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(data.loadedData).decodeArray_uint32().length, data.secondData.length);
    assertEq(data.loadedData.length, data.newSecondDataBytes.length);
    assertEq(data.loadedData, data.newSecondDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(this.getField(data.tableId, data.keyTuple, 0, fieldLayout)), data.firstDataBytes);
    assertEq(this.getField(data.tableId, data.keyTuple, 2, fieldLayout), data.thirdDataBytes);

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

    // Expect a Store_SpliceDynamicData event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SpliceDynamicData(
      data.tableId,
      data.keyTuple,
      1,
      uint48(data.newSecondDataBytes.length + 8 * 1),
      8 * 4,
      EncodedLengthsLib.pack(data.newSecondDataBytes.length, data.newThirdDataBytes.length),
      data.thirdDataForUpdate
    );

    // Update indexes 1,2,3,4 in third field (8 = byte length of uint64)
    this.spliceDynamicData(
      data.tableId,
      data.keyTuple,
      1,
      uint40(8 * 1),
      uint40(data.thirdDataForUpdate.length),
      data.thirdDataForUpdate
    );

    // Get third field
    data.loadedData = this.getField(data.tableId, data.keyTuple, 2, fieldLayout);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(data.loadedData).decodeArray_uint64().length, data.thirdData.length);
    assertEq(data.loadedData.length, data.newThirdDataBytes.length);
    assertEq(data.loadedData, data.newThirdDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(this.getField(data.tableId, data.keyTuple, 0, fieldLayout)), data.firstDataBytes);
    assertEq(this.getField(data.tableId, data.keyTuple, 1, fieldLayout), data.newSecondDataBytes);

    // startByteIndex must not overflow
    vm.expectRevert(
      abi.encodeWithSelector(
        IStoreErrors.Store_IndexOutOfBounds.selector,
        data.newThirdDataBytes.length - uint40(data.thirdDataForUpdate.length),
        uint40(type(uint56).max)
      )
    );
    this.spliceDynamicData(
      data.tableId,
      data.keyTuple,
      1,
      uint40(type(uint56).max),
      uint40(data.thirdDataForUpdate.length),
      data.thirdDataForUpdate
    );

    // startByteIndex + deleteCount must not overflow
    vm.expectRevert(
      abi.encodeWithSelector(
        IStoreErrors.Store_IndexOutOfBounds.selector,
        data.newThirdDataBytes.length - 8,
        data.newThirdDataBytes.length
      )
    );
    this.spliceDynamicData(
      data.tableId,
      data.keyTuple,
      1,
      uint40(data.newThirdDataBytes.length), // set start to end of the field
      uint40(8), // delete 8 bytes (after the start index, so after the size of the field)
      abi.encodePacked(uint64(1)) // append 8 bytes
    );
  }

  function testAccessEmptyData() public {
    ResourceId tableId = _tableId;

    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(4, 1);
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT32, SchemaType.UINT32_ARRAY);

    this.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](2));

    // Create keyTuple
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = bytes32("some key");

    (bytes memory data1, , ) = this.getRecord(tableId, keyTuple, fieldLayout);
    assertEq(data1.length, fieldLayout.staticDataLength());

    bytes memory data2 = this.getField(tableId, keyTuple, 0, fieldLayout);
    assertEq(data2.length, fieldLayout.staticDataLength());

    bytes memory data3 = this.getField(tableId, keyTuple, 1, fieldLayout);
    assertEq(data3.length, 0);

    uint256 data3Length = this.getFieldLength(tableId, keyTuple, 1, fieldLayout);
    assertEq(data3Length, 0);

    vm.expectRevert(abi.encodeWithSelector(IStoreErrors.Store_IndexOutOfBounds.selector, 0, 0));
    bytes memory data3Slice = this.getDynamicFieldSlice(tableId, keyTuple, 0, 0, 0);
    assertEq(data3Slice.length, 0);
  }

  function testRegisterHook() public {
    ResourceId tableId = _tableId;

    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = "some key";

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 0);
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT128);
    this.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Create subscriber
    MirrorSubscriber subscriber = new MirrorSubscriber(
      tableId,
      fieldLayout,
      defaultKeySchema,
      valueSchema,
      new string[](1),
      new string[](1)
    );

    this.registerStoreHook(tableId, subscriber, BEFORE_ALL);

    bytes memory staticData = abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10));

    this.setRecord(tableId, keyTuple, staticData, EncodedLengths.wrap(bytes32(0)), new bytes(0));

    // Get data from indexed table - the indexer should have mirrored the data there
    (bytes memory indexedData, , ) = this.getRecord(indexerTableId, keyTuple, fieldLayout);
    assertEq(keccak256(staticData), keccak256(indexedData));

    staticData = abi.encodePacked(bytes16(0x1112131415161718191a1b1c1d1e1f20));

    this.setField(tableId, keyTuple, 0, staticData, fieldLayout);

    // Get data from indexed table - the indexer should have mirrored the data there
    (indexedData, , ) = this.getRecord(indexerTableId, keyTuple, fieldLayout);
    assertEq(keccak256(staticData), keccak256(indexedData));

    this.deleteRecord(tableId, keyTuple);

    // Get data from indexed table - the indexer should have mirrored the data there
    (indexedData, , ) = this.getRecord(indexerTableId, keyTuple, fieldLayout);
    assertEq(keccak256(indexedData), keccak256(abi.encodePacked(bytes16(0))));
  }

  function testRegisterHookBeforeTable() public {
    ResourceId tableId = _tableId;

    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = "some key";

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 0);
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT128);

    // Create subscriber
    MirrorSubscriber subscriber = new MirrorSubscriber(
      tableId,
      fieldLayout,
      defaultKeySchema,
      valueSchema,
      new string[](1),
      new string[](1)
    );

    vm.expectRevert(
      abi.encodeWithSelector(IStoreErrors.Store_TableNotFound.selector, tableId, string(abi.encodePacked(tableId)))
    );
    this.registerStoreHook(tableId, subscriber, BEFORE_ALL);
  }

  function testUnregisterHook() public {
    ResourceId tableId = _tableId;

    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = "some key";

    // Register table's value schema
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 1);
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT128, SchemaType.STRING);
    this.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](2));

    // Create a RevertSubscriber and an EchoSubscriber
    RevertSubscriber revertSubscriber = new RevertSubscriber();
    EchoSubscriber echoSubscriber = new EchoSubscriber();

    // Register both subscribers
    this.registerStoreHook(tableId, revertSubscriber, ALL);
    // Register both subscribers
    this.registerStoreHook(tableId, echoSubscriber, ALL);

    bytes memory staticData = abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10));
    bytes memory dynamicData = abi.encodePacked(bytes("some string"));
    EncodedLengths encodedLengths = EncodedLengthsLib.pack(dynamicData.length);

    // Expect a revert when the RevertSubscriber's onBeforeSetRecord hook is called
    vm.expectRevert(bytes("onBeforeSetRecord"));
    this.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);

    // Expect a revert when the RevertSubscriber's onBeforeSpliceStaticData hook is called
    vm.expectRevert(bytes("onBeforeSpliceStaticData"));
    this.setField(tableId, keyTuple, 0, staticData, fieldLayout);

    // Expect a revert when the RevertSubscriber's hook onBeforeSpliceDynamicData is called
    vm.expectRevert(bytes("onBeforeSpliceDynamicData"));
    this.setField(tableId, keyTuple, 1, dynamicData, fieldLayout);

    // Expect a revert when the RevertSubscriber's onBeforeDeleteRecord hook is called
    vm.expectRevert(bytes("onBeforeDeleteRecord"));
    this.deleteRecord(tableId, keyTuple);

    // Unregister the RevertSubscriber
    this.unregisterStoreHook(tableId, revertSubscriber);

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onBeforeSetRecord hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(
      abi.encodeCall(
        IStoreHook.onBeforeSetRecord,
        (tableId, keyTuple, staticData, encodedLengths, dynamicData, fieldLayout)
      )
    );

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onAfterSetRecord hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(
      abi.encodeCall(
        IStoreHook.onAfterSetRecord,
        (tableId, keyTuple, staticData, encodedLengths, dynamicData, fieldLayout)
      )
    );

    this.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onBeforeSpliceStaticData hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encodeCall(IStoreHook.onBeforeSpliceStaticData, (tableId, keyTuple, 0, staticData)));

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onAfterSpliceStaticData hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encodeCall(IStoreHook.onAfterSpliceStaticData, (tableId, keyTuple, 0, staticData)));

    this.setField(tableId, keyTuple, 0, staticData, fieldLayout);

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onBeforeSpliceDynamicData hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(
      abi.encodeCall(
        IStoreHook.onBeforeSpliceDynamicData,
        (tableId, keyTuple, 0, 0, uint40(dynamicData.length), encodedLengths, dynamicData)
      )
    );

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onAfterSpliceDynamicData hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(
      abi.encodeCall(
        IStoreHook.onAfterSpliceDynamicData,
        (tableId, keyTuple, 0, 0, uint40(dynamicData.length), encodedLengths, dynamicData)
      )
    );

    this.setField(tableId, keyTuple, 1, dynamicData, fieldLayout);

    // TODO: add tests for hooks being called for all other dynamic operations

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onBeforeDeleteRecord hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encodeCall(IStoreHook.onBeforeDeleteRecord, (tableId, keyTuple, fieldLayout)));

    // Expect a HookCalled event to be emitted when the EchoSubscriber's onAfterDeleteRecord hook is called
    vm.expectEmit(true, true, true, true);
    emit HookCalled(abi.encodeCall(IStoreHook.onAfterDeleteRecord, (tableId, keyTuple, fieldLayout)));

    this.deleteRecord(tableId, keyTuple);
  }

  struct RecordData {
    bytes staticData;
    EncodedLengths encodedLengths;
    bytes dynamicData;
  }

  function testHooksDynamicData() public {
    ResourceId tableId = _tableId;

    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = "some key";

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 1);
    Schema valueSchema = SchemaEncodeHelper.encode(SchemaType.UINT128, SchemaType.UINT32_ARRAY);
    this.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](2));

    // Create subscriber
    MirrorSubscriber subscriber = new MirrorSubscriber(
      tableId,
      fieldLayout,
      defaultKeySchema,
      valueSchema,
      new string[](1),
      new string[](2)
    );

    this.registerStoreHook(tableId, subscriber, BEFORE_ALL);

    uint32[] memory arrayData = new uint32[](1);
    arrayData[0] = 0x01020304;
    bytes memory arrayDataBytes = EncodeArray.encode(arrayData);
    RecordData memory recordData = RecordData({
      staticData: abi.encodePacked(bytes16(0x0102030405060708090a0b0c0d0e0f10)),
      encodedLengths: EncodedLengthsLib.pack(uint40(arrayDataBytes.length)),
      dynamicData: arrayDataBytes
    });

    this.setRecord(tableId, keyTuple, recordData.staticData, recordData.encodedLengths, recordData.dynamicData);

    // Get data from indexed table - the indexer should have mirrored the data there
    RecordData memory loadedData;
    (loadedData.staticData, loadedData.encodedLengths, loadedData.dynamicData) = this.getRecord(
      indexerTableId,
      keyTuple,
      fieldLayout
    );
    assertEq(loadedData.staticData, recordData.staticData);
    assertEq(loadedData.encodedLengths.unwrap(), recordData.encodedLengths.unwrap());
    assertEq(loadedData.dynamicData, recordData.dynamicData);

    // Update dynamic data
    arrayData[0] = 0x11121314;
    arrayDataBytes = EncodeArray.encode(arrayData);
    recordData.dynamicData = arrayDataBytes;

    this.setField(tableId, keyTuple, 1, arrayDataBytes, fieldLayout);

    // Get data from indexed table - the indexer should have mirrored the data there
    (loadedData.staticData, loadedData.encodedLengths, loadedData.dynamicData) = this.getRecord(
      indexerTableId,
      keyTuple,
      fieldLayout
    );
    assertEq(loadedData.staticData, recordData.staticData);
    assertEq(loadedData.encodedLengths.unwrap(), recordData.encodedLengths.unwrap());
    assertEq(loadedData.dynamicData, recordData.dynamicData);

    this.deleteRecord(tableId, keyTuple);

    // Get data from indexed table - the indexer should have mirrored the data there
    (loadedData.staticData, loadedData.encodedLengths, loadedData.dynamicData) = this.getRecord(
      indexerTableId,
      keyTuple,
      fieldLayout
    );
    assertEq(loadedData.staticData, abi.encodePacked(bytes16(0)));
    assertEq(loadedData.encodedLengths.unwrap(), bytes32(0));
    assertEq(loadedData.dynamicData, "");
  }

  function testSetDataOffchainTable() public {
    ResourceId tableId = _tableId3;

    // Register offchain table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(1, 2, 1, 2, 0);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT8,
      SchemaType.UINT16,
      SchemaType.UINT8,
      SchemaType.UINT16
    );

    this.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](4));

    // Set data
    bytes memory staticData = abi.encodePacked(bytes1(0x01), bytes2(0x0203), bytes1(0x04), bytes2(0x0506));

    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = "some key";

    // Expect a Store_SetRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SetRecord(tableId, keyTuple, staticData, EncodedLengths.wrap(bytes32(0)), new bytes(0));

    this.setRecord(tableId, keyTuple, staticData, EncodedLengths.wrap(bytes32(0)), new bytes(0));
  }

  function testDeleteDataOffchainTable() public {
    ResourceId tableId = _tableId3;

    // Register table
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(16, 2);
    {
      Schema valueSchema = SchemaEncodeHelper.encode(
        SchemaType.UINT128,
        SchemaType.UINT32_ARRAY,
        SchemaType.UINT32_ARRAY
      );
      this.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](3));
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

    EncodedLengths encodedDynamicLength;
    {
      encodedDynamicLength = EncodedLengthsLib.pack(uint40(secondDataBytes.length), uint40(thirdDataBytes.length));
    }

    // Concat data
    bytes memory staticData = abi.encodePacked(firstDataBytes);
    bytes memory dynamicData = abi.encodePacked(secondDataBytes, thirdDataBytes);

    // Create keyTuple
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = bytes32("some key");

    // Set data
    this.setRecord(tableId, keyTuple, staticData, encodedDynamicLength, dynamicData);

    // Expect a Store_DeleteRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_DeleteRecord(tableId, keyTuple);

    // Delete data
    this.deleteRecord(tableId, keyTuple);
  }
}
