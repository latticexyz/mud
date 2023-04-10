// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreCoreDynamicPartial } from "../src/StoreCoreDynamicPartial.sol";
import { SliceLib } from "../src/Slice.sol";
import { EncodeArray } from "../src/tightcoder/EncodeArray.sol";
import { Schema, SchemaLib } from "../src/Schema.sol";
import { StoreView } from "../src/StoreView.sol";
import { IErrors } from "../src/IErrors.sol";

contract StoreCoreDynamicPartialTest is Test, StoreView {
  mapping(uint256 => bytes) private testMapping;
  Schema defaultKeySchema = SchemaLib.encode(SchemaType.BYTES32);

  // Expose an external pushToField function for testing purposes of indexers (see testHooks)
  function pushToField(
    uint256 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush
  ) public override {
    StoreCoreDynamicPartial.pushToField(table, key, schemaIndex, dataToPush);
  }

  // Expose an external updateInField function for testing purposes of indexers (see testHooks)
  function updateInField(
    uint256 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet
  ) public override {
    StoreCoreDynamicPartial.updateInField(table, key, schemaIndex, startByteIndex, dataToSet);
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
    StoreCoreDynamicPartial.pushToField(table, key, 2, thirdDataBytes);

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
    StoreCoreDynamicPartial.pushToField(table, key, 1, secondDataToPush);

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
    StoreCoreDynamicPartial.pushToField(table, key, 2, thirdDataToPush);

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

  function testUpdateInField() public {
    uint256 table = uint256(keccak256("some.table"));

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

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(table, key, 1, newSecondDataBytes);

    // Update index 1 in second field (4 = byte length of uint32)
    // !gasreport update in field (1 slot, 1 uint32 item)
    StoreCoreDynamicPartial.updateInField(table, key, 1, 4 * 1, secondDataForUpdate);

    // Get second field
    bytes memory loadedData = StoreCore.getField(table, key, 1);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(loadedData).decodeArray_uint32().length, secondData.length);
    assertEq(loadedData.length, newSecondDataBytes.length);
    assertEq(loadedData, newSecondDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(StoreCore.getField(table, key, 0)), firstDataBytes);
    assertEq(StoreCore.getField(table, key, 2), thirdDataBytes);

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

    // Expect a StoreSetField event to be emitted
    vm.expectEmit(true, true, true, true);
    emit StoreSetField(table, key, 2, newThirdDataBytes);

    // Update indexes 1,2,3,4 in third field (8 = byte length of uint64)
    // !gasreport push to field (2 slots, 6 uint64 items)
    StoreCoreDynamicPartial.updateInField(table, key, 2, 8 * 1, thirdDataForUpdate);

    // Get third field
    loadedData = StoreCore.getField(table, key, 2);

    // Verify loaded data is correct
    assertEq(SliceLib.fromBytes(loadedData).decodeArray_uint64().length, thirdData.length);
    assertEq(loadedData.length, newThirdDataBytes.length);
    assertEq(loadedData, newThirdDataBytes);

    // Verify none of the other fields were impacted
    assertEq(bytes32(StoreCore.getField(table, key, 0)), firstDataBytes);
    assertEq(StoreCore.getField(table, key, 1), newSecondDataBytes);

    // startByteIndex must not overflow
    vm.expectRevert(
      abi.encodeWithSelector(IErrors.StoreCore_DataIndexOverflow.selector, type(uint16).max, type(uint32).max)
    );
    StoreCoreDynamicPartial.updateInField(table, key, 2, type(uint32).max, thirdDataForUpdate);
  }
}
