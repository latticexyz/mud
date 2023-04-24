// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { SliceLib } from "../src/Slice.sol";
import { EncodeArray } from "../src/tightcoder/EncodeArray.sol";
import { Schema, SchemaLib } from "../src/Schema.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { IErrors } from "../src/IErrors.sol";

contract StoreCoreDynamicUpdateTest is Test, StoreReadWithStubs {
  Schema internal defaultKeySchema = SchemaLib.encode(SchemaType.BYTES32);

  bytes32[] internal _key;
  bytes32 internal _table = keccak256("some.table");

  bytes32 internal firstDataBytes;
  uint32[] internal secondData;
  bytes internal secondDataBytes;
  uint32[] internal thirdData;
  bytes internal thirdDataBytes;

  // Expose an external popFromField function for testing purposes of indexers (see testHooks)
  function popFromField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 byteLengthToPop
  ) public override {
    StoreCore.popFromField(table, key, schemaIndex, byteLengthToPop);
  }

  function setUp() public {
    // Register table's schema
    Schema schema = SchemaLib.encode(SchemaType.UINT256, SchemaType.UINT32_ARRAY, SchemaType.UINT32_ARRAY);
    StoreCore.registerSchema(_table, schema, defaultKeySchema);

    // Create key
    _key = new bytes32[](1);
    _key[0] = bytes32("some.key");

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
    StoreCore.setField(_table, _key, 0, abi.encodePacked(firstDataBytes));
    StoreCore.setField(_table, _key, 1, secondDataBytes);
    // Initialize a field with push
    StoreCore.pushToField(_table, _key, 2, thirdDataBytes);
  }

  function testPopFromSecondField() public {
    bytes memory dataBytes = secondDataBytes;

    // Prepare expected data
    uint256 byteLengthToPop = 1 * 4;
    bytes memory newDataBytes = SliceLib.getSubslice(dataBytes, 0, dataBytes.length - byteLengthToPop).toBytes();
    // Make sure the data decodes correctly
    assertEq(SliceLib.fromBytes(dataBytes).decodeArray_uint32().length, 2);
    assertEq(SliceLib.fromBytes(newDataBytes).decodeArray_uint32().length, 2 - 1);

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(_table, _key, 1, newDataBytes);

    // Pop from second field
    // !gasreport pop from field (cold, 1 slot, 1 uint32 item)
    StoreCore.popFromField(_table, _key, 1, byteLengthToPop);
    // Get second field
    bytes memory loadedData = StoreCore.getField(_table, _key, 1);
    // Verify loaded data is correct
    assertEq(loadedData, newDataBytes);

    // Reset the second field and pop again (but warm this time)
    StoreCore.setField(_table, _key, 1, dataBytes);
    // !gasreport pop from field (warm, 1 slot, 1 uint32 item)
    StoreCore.popFromField(_table, _key, 1, byteLengthToPop);
    // Get second field
    loadedData = StoreCore.getField(_table, _key, 1);
    // Verify loaded data is correct
    assertEq(loadedData, newDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(StoreCore.getField(_table, _key, 0)), firstDataBytes);
    assertEq(StoreCore.getField(_table, _key, 2), thirdDataBytes);
  }

  function testPopFromThirdField() public {
    bytes memory dataBytes = thirdDataBytes;

    // Prepare expected data
    uint256 byteLengthToPop = 10 * 4;
    bytes memory newDataBytes = SliceLib.getSubslice(dataBytes, 0, dataBytes.length - byteLengthToPop).toBytes();
    // Make sure the data decodes correctly
    assertEq(SliceLib.fromBytes(dataBytes).decodeArray_uint32().length, 10);
    assertEq(SliceLib.fromBytes(newDataBytes).decodeArray_uint32().length, 10 - 10);

    // Expect a StoreSetField event to be emitted after pop
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(_table, _key, 2, dataBytes);

    // Pop from the field
    // !gasreport pop from field (cold, 2 slots, 10 uint32 items)
    StoreCore.popFromField(_table, _key, 2, byteLengthToPop);
    // Load and verify the field
    bytes memory loadedData = StoreCore.getField(_table, _key, 2);
    assertEq(loadedData, newDataBytes);

    // Reset the field and pop again (but warm this time)
    StoreCore.setField(_table, _key, 2, dataBytes);
    // !gasreport pop from field (warm, 2 slots, 10 uint32 items)
    StoreCore.popFromField(_table, _key, 2, byteLengthToPop);
    // Load and verify the field
    loadedData = StoreCore.getField(_table, _key, 2);
    assertEq(loadedData, newDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(StoreCore.getField(_table, _key, 0)), firstDataBytes);
    assertEq(StoreCore.getField(_table, _key, 1), secondDataBytes);
  }
}
