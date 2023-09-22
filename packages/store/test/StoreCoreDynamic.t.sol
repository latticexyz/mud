// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { SliceLib } from "../src/Slice.sol";
import { EncodeArray } from "../src/tightcoder/EncodeArray.sol";
import { PackedCounterLib } from "../src/PackedCounter.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { Schema } from "../src/Schema.sol";
import { ResourceId, ResourceIdLib } from "../src/ResourceId.sol";
import { RESOURCE_TABLE } from "../src/storeResourceTypes.sol";
import { StoreMock } from "../test/StoreMock.sol";
import { FieldLayoutEncodeHelper } from "./FieldLayoutEncodeHelper.sol";
import { SchemaEncodeHelper } from "./SchemaEncodeHelper.sol";

contract StoreCoreDynamicTest is Test, GasReporter, StoreMock {
  Schema internal defaultKeySchema = SchemaEncodeHelper.encode(SchemaType.BYTES32);

  bytes32[] internal _keyTuple;
  ResourceId internal _tableId = ResourceIdLib.encode({ typeId: RESOURCE_TABLE, name: "some table" });

  bytes32 internal firstDataBytes;
  uint32[] internal secondData;
  bytes internal secondDataBytes;
  uint32[] internal thirdData;
  bytes internal thirdDataBytes;

  // Expose an external popFromField function for testing purposes of indexers (see testHooks)
  function popFromField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    uint256 byteLengthToPop,
    FieldLayout fieldLayout
  ) public override {
    StoreCore.popFromField(tableId, keyTuple, fieldIndex, byteLengthToPop, fieldLayout);
  }

  function setUp() public {
    // Register table's value schema
    FieldLayout fieldLayout = FieldLayoutEncodeHelper.encode(32, 2);
    Schema valueSchema = SchemaEncodeHelper.encode(
      SchemaType.UINT256,
      SchemaType.UINT32_ARRAY,
      SchemaType.UINT32_ARRAY
    );
    StoreCore.registerTable(_tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](3));

    // Create keyTuple
    _keyTuple = new bytes32[](1);
    _keyTuple[0] = bytes32("some.key");

    // Initialize the data in setUp so that slots aren't warm in tests (to test cold update)

    // Create data
    firstDataBytes = keccak256("some data");
    secondData = new uint32[](2);
    secondData[0] = 0x11121314;
    secondData[1] = 0x15161718;
    secondDataBytes = EncodeArray.encode(secondData);

    thirdData = new uint32[](10);
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
    thirdDataBytes = EncodeArray.encode(thirdData);

    // Set fields
    StoreCore.setField(_tableId, _keyTuple, 0, abi.encodePacked(firstDataBytes), fieldLayout);
    StoreCore.setField(_tableId, _keyTuple, 1, secondDataBytes, fieldLayout);
    // Initialize a field with push
    StoreCore.pushToField(_tableId, _keyTuple, 2, thirdDataBytes, fieldLayout);
  }

  function testPopFromSecondField() public {
    FieldLayout fieldLayout = StoreCore.getFieldLayout(_tableId);
    bytes memory dataBytes = secondDataBytes;

    // Prepare expected data
    uint256 byteLengthToPop = 1 * 4;
    bytes memory newDataBytes = SliceLib.getSubslice(dataBytes, 0, dataBytes.length - byteLengthToPop).toBytes();
    // Make sure the data decodes correctly
    assertEq(SliceLib.fromBytes(dataBytes).decodeArray_uint32().length, 2);
    assertEq(SliceLib.fromBytes(newDataBytes).decodeArray_uint32().length, 2 - 1);

    // Expect a StoreSpliceRecord event to be emitted
    vm.expectEmit(true, true, true, true);
    emit Store_SpliceDynamicData(
      _tableId,
      _keyTuple,
      uint48(secondDataBytes.length - byteLengthToPop),
      uint40(byteLengthToPop),
      new bytes(0),
      PackedCounterLib.pack(newDataBytes.length, thirdDataBytes.length).unwrap()
    );

    // Pop from second field
    startGasReport("pop from field (cold, 1 slot, 1 uint32 item)");
    StoreCore.popFromField(_tableId, _keyTuple, 1, byteLengthToPop, fieldLayout);
    endGasReport();
    // Get second field
    bytes memory loadedData = StoreCore.getField(_tableId, _keyTuple, 1, fieldLayout);
    // Verify loaded data is correct
    assertEq(loadedData, newDataBytes);

    // Reset the second field and pop again (but warm this time)
    StoreCore.setField(_tableId, _keyTuple, 1, dataBytes, fieldLayout);
    startGasReport("pop from field (warm, 1 slot, 1 uint32 item)");
    StoreCore.popFromField(_tableId, _keyTuple, 1, byteLengthToPop, fieldLayout);
    endGasReport();
    // Get second field
    loadedData = StoreCore.getField(_tableId, _keyTuple, 1, fieldLayout);
    // Verify loaded data is correct
    assertEq(loadedData, newDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(StoreCore.getField(_tableId, _keyTuple, 0, fieldLayout)), firstDataBytes);
    assertEq(StoreCore.getField(_tableId, _keyTuple, 2, fieldLayout), thirdDataBytes);
  }

  function testPopFromThirdField() public {
    FieldLayout fieldLayout = StoreCore.getFieldLayout(_tableId);
    bytes memory dataBytes = thirdDataBytes;

    // Prepare expected data
    uint256 byteLengthToPop = 10 * 4;
    bytes memory newDataBytes = SliceLib.getSubslice(dataBytes, 0, dataBytes.length - byteLengthToPop).toBytes();
    // Make sure the data decodes correctly
    assertEq(SliceLib.fromBytes(dataBytes).decodeArray_uint32().length, 10);
    assertEq(SliceLib.fromBytes(newDataBytes).decodeArray_uint32().length, 10 - 10);

    // Expect a StoreSpliceRecord event to be emitted after pop
    vm.expectEmit(true, true, true, true);
    emit Store_SpliceDynamicData(
      _tableId,
      _keyTuple,
      uint48(secondDataBytes.length + thirdDataBytes.length - byteLengthToPop),
      uint40(byteLengthToPop),
      new bytes(0),
      PackedCounterLib.pack(secondDataBytes.length, newDataBytes.length).unwrap()
    );

    // Pop from the field
    startGasReport("pop from field (cold, 2 slots, 10 uint32 items)");
    StoreCore.popFromField(_tableId, _keyTuple, 2, byteLengthToPop, fieldLayout);
    endGasReport();
    // Load and verify the field
    bytes memory loadedData = StoreCore.getField(_tableId, _keyTuple, 2, fieldLayout);
    assertEq(loadedData, newDataBytes);

    // Reset the field and pop again (but warm this time)
    StoreCore.setField(_tableId, _keyTuple, 2, dataBytes, fieldLayout);
    startGasReport("pop from field (warm, 2 slots, 10 uint32 items)");
    StoreCore.popFromField(_tableId, _keyTuple, 2, byteLengthToPop, fieldLayout);
    endGasReport();
    // Load and verify the field
    loadedData = StoreCore.getField(_tableId, _keyTuple, 2, fieldLayout);
    assertEq(loadedData, newDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(StoreCore.getField(_tableId, _keyTuple, 0, fieldLayout)), firstDataBytes);
    assertEq(StoreCore.getField(_tableId, _keyTuple, 1, fieldLayout), secondDataBytes);
  }

  function testGetSecondFieldLength() public {
    FieldLayout fieldLayout = StoreCore.getFieldLayout(_tableId);

    startGasReport("get field length (cold, 1 slot)");
    uint256 length = StoreCore.getFieldLength(_tableId, _keyTuple, 1, fieldLayout);
    endGasReport();
    assertEq(length, secondDataBytes.length);
    startGasReport("get field length (warm, 1 slot)");
    length = StoreCore.getFieldLength(_tableId, _keyTuple, 1, fieldLayout);
    endGasReport();
    assertEq(length, secondDataBytes.length);
  }

  function testGetThirdFieldLength() public {
    FieldLayout fieldLayout = StoreCore.getFieldLayout(_tableId);

    startGasReport("get field length (warm due to , 2 slots)");
    uint256 length = StoreCore.getFieldLength(_tableId, _keyTuple, 2, fieldLayout);
    endGasReport();
    assertEq(length, thirdDataBytes.length);
    startGasReport("get field length (warm, 2 slots)");
    length = StoreCore.getFieldLength(_tableId, _keyTuple, 2, fieldLayout);
    endGasReport();
    assertEq(length, thirdDataBytes.length);
  }

  function testGetFieldSlice() public {
    FieldLayout fieldLayout = StoreCore.getFieldLayout(_tableId);

    startGasReport("get field slice (cold, 1 slot)");
    bytes memory secondFieldSlice = StoreCore.getFieldSlice(_tableId, _keyTuple, 1, fieldLayout, 0, 4);
    endGasReport();
    assertEq(secondFieldSlice, SliceLib.getSubslice(secondDataBytes, 0, 4).toBytes());
    startGasReport("get field slice (warm, 1 slot)");
    secondFieldSlice = StoreCore.getFieldSlice(_tableId, _keyTuple, 1, fieldLayout, 4, 8);
    endGasReport();
    assertEq(secondFieldSlice, SliceLib.getSubslice(secondDataBytes, 4, 8).toBytes());

    startGasReport("get field slice (semi-cold, 1 slot)");
    bytes memory thirdFieldSlice = StoreCore.getFieldSlice(_tableId, _keyTuple, 2, fieldLayout, 4, 32);
    endGasReport();
    assertEq(thirdFieldSlice, SliceLib.getSubslice(thirdDataBytes, 4, 32).toBytes());
    startGasReport("get field slice (warm, 2 slots)");
    thirdFieldSlice = StoreCore.getFieldSlice(_tableId, _keyTuple, 2, fieldLayout, 8, 40);
    endGasReport();
    assertEq(thirdFieldSlice, SliceLib.getSubslice(thirdDataBytes, 8, 40).toBytes());
  }
}
