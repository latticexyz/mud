// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { FieldLayoutEncodeHelper } from "@latticexyz/store/test/FieldLayoutEncodeHelper.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { SchemaEncodeHelper } from "@latticexyz/store/test/SchemaEncodeHelper.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";

import { World } from "../src/World.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "../src/WorldResourceId.sol";
import { RESOURCE_TABLE } from "../src/worldResourceTypes.sol";

import { AddressArray } from "./tables/AddressArray.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";

import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";

contract UpdateInDynamicFieldTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  event HookCalled(bytes data);
  event WorldTestSystemLog(string log);

  Schema internal defaultKeySchema = SchemaEncodeHelper.encode(SchemaType.BYTES32);
  IBaseWorld internal world;

  bytes32 internal key;
  bytes32[] internal keyTuple;
  bytes32[] internal singletonKey;

  bytes14 namespace;
  bytes16 name;
  ResourceId internal tableId;
  address[] internal initData;
  bytes internal encodedData;

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.initialize(new CoreModule());

    key = "testKey";
    keyTuple = new bytes32[](1);
    keyTuple[0] = key;
    singletonKey = new bytes32[](0);
    FieldLayout fieldLayout = AddressArray.getFieldLayout();
    Schema valueSchema = AddressArray.getValueSchema();

    // Initialize the data in setUp so that slots aren't warm in tests (to test cold update)

    namespace = "DynamicUpdTest";
    name = "testTable";
    tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: name });

    // Register a new table
    world.registerTable(tableId, fieldLayout, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Create data
    initData = new address[](3);
    initData[0] = address(0x01);
    initData[1] = address(bytes20(keccak256("some address")));
    initData[2] = address(bytes20(keccak256("another address")));
    encodedData = EncodeArray.encode(initData);

    world.setField(tableId, keyTuple, 0, encodedData, fieldLayout);
  }

  // Expect an error when trying to write from an address that doesn't have access
  function _expectAccessDenied(address _caller, ResourceId _tableId) internal {
    vm.prank(_caller);
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.World_AccessDenied.selector, _tableId.toString(), _caller));
  }

  function testPopFromDynamicField() public {
    FieldLayout fieldLayout = AddressArray.getFieldLayout();

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Pop 1 item
    uint256 byteLengthToPop = 20;

    startGasReport("pop 1 address (cold)");
    world.popFromDynamicField(tableId, keyTuple, 0, byteLengthToPop);
    endGasReport();

    // Expect the data to be updated
    address[] memory loadedData = AddressArray.get(world, tableId, key);
    assertEq(loadedData.length, initData.length - 1);
    for (uint256 i; i < loadedData.length; i++) {
      assertEq(loadedData[i], initData[i]);
    }

    // Pop 1 more item
    byteLengthToPop = 20;

    startGasReport("pop 1 address (warm)");
    world.popFromDynamicField(tableId, keyTuple, 0, byteLengthToPop);
    endGasReport();

    // Expect the data to be updated
    loadedData = AddressArray.get(world, tableId, key);
    assertEq(loadedData.length, initData.length - 2);
    for (uint256 i; i < loadedData.length; i++) {
      assertEq(loadedData[i], initData[i]);
    }

    // Reset data
    world.setField(tableId, keyTuple, 0, encodedData, fieldLayout);
    // Pop 2 items via direct access
    byteLengthToPop = 20 * 2;
    world.popFromDynamicField(tableId, keyTuple, 0, byteLengthToPop);
    // Expect the data to be updated
    loadedData = AddressArray.get(world, tableId, key);
    assertEq(loadedData.length, initData.length - 2);
    for (uint256 i; i < loadedData.length; i++) {
      assertEq(loadedData[i], initData[i]);
    }

    // Expect an error when trying to write from an address that doesn't have access
    _expectAccessDenied(address(0x01), tableId);
    world.popFromDynamicField(tableId, keyTuple, 0, 20);

    // Expect the World to not have access
    vm.prank(address(world));
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.World_CallbackNotAllowed.selector, world.popFromDynamicField.selector)
    );
    world.popFromDynamicField(tableId, keyTuple, 0, 20);
  }

  function testSpliceDynamicData() public {
    FieldLayout fieldLayout = AddressArray.getFieldLayout();

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Update index 0
    address[] memory dataForUpdate = new address[](1);
    dataForUpdate[0] = address(bytes20(keccak256("address for update")));
    bytes memory encodedDataForUpdate = EncodeArray.encode(dataForUpdate);

    startGasReport("update in field 1 item (cold)");
    world.spliceDynamicData(tableId, keyTuple, 0, uint40(0), uint40(encodedDataForUpdate.length), encodedDataForUpdate);
    endGasReport();

    startGasReport("update in field 1 item (warm)");
    world.spliceDynamicData(tableId, keyTuple, 0, uint40(0), uint40(encodedDataForUpdate.length), encodedDataForUpdate);
    endGasReport();

    // Expect the data to be updated
    initData[0] = dataForUpdate[0];
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Update index 1 via direct access
    world.spliceDynamicData(
      tableId,
      keyTuple,
      0,
      uint40(20 * 1),
      uint40(encodedDataForUpdate.length),
      encodedDataForUpdate
    );

    // Expect the data to be updated
    initData[1] = dataForUpdate[0];
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Expect an error when trying to write from an address that doesn't have access
    _expectAccessDenied(address(0x01), tableId);
    world.spliceDynamicData(tableId, keyTuple, 0, uint40(0), uint40(encodedDataForUpdate.length), encodedDataForUpdate);

    // Expect the World to not have access
    vm.prank(address(world));
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.World_CallbackNotAllowed.selector, world.spliceDynamicData.selector)
    );
    world.spliceDynamicData(tableId, keyTuple, 0, uint40(0), uint40(encodedDataForUpdate.length), encodedDataForUpdate);
  }
}
