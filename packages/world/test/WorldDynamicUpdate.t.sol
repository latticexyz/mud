// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { SchemaEncodeHelper } from "@latticexyz/store/test/SchemaEncodeHelper.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";

import { World } from "../src/World.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";

import { NamespaceOwner } from "../src/tables/NamespaceOwner.sol";
import { ResourceAccess } from "../src/tables/ResourceAccess.sol";
import { AddressArray } from "./tables/AddressArray.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";

import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";

contract UpdateInFieldTest is Test, GasReporter {
  using ResourceSelector for bytes32;

  event HookCalled(bytes data);
  event WorldTestSystemLog(string log);

  Schema internal defaultKeySchema = SchemaEncodeHelper.encode(SchemaType.BYTES32);
  IBaseWorld internal world;

  bytes32 internal key;
  bytes32[] internal keyTuple;
  bytes32[] internal singletonKey;

  bytes32 internal tableId;
  address[] internal initData;
  bytes internal encodedData;

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));

    key = "testKey";
    keyTuple = new bytes32[](1);
    keyTuple[0] = key;
    singletonKey = new bytes32[](0);
    Schema valueSchema = AddressArray.getValueSchema();

    // Initialize the data in setUp so that slots aren't warm in tests (to test cold update)

    bytes16 namespace = "DynamicUpdTest";
    bytes16 name = "testTable";

    // Register a new table
    tableId = world.registerTable(namespace, name, defaultKeySchema, valueSchema, new string[](1), new string[](1));

    // Create data
    initData = new address[](3);
    initData[0] = address(0x01);
    initData[1] = address(bytes20(keccak256("some address")));
    initData[2] = address(bytes20(keccak256("another address")));
    encodedData = EncodeArray.encode(initData);

    world.setField(namespace, name, keyTuple, 0, encodedData, valueSchema);
  }

  // Expect an error when trying to write from an address that doesn't have access
  function _expectAccessDenied(address caller, bytes16 namespace, bytes16 name) internal {
    vm.prank(caller);
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.AccessDenied.selector,
        ResourceSelector.from(namespace, name).toString(),
        caller
      )
    );
  }

  function testPopFromField() public {
    bytes16 namespace = "DynamicUpdTest";
    bytes16 name = "testTable";
    Schema valueSchema = AddressArray.getValueSchema();

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Pop 1 item
    uint256 byteLengthToPop = 20;

    startGasReport("pop 1 address (cold)");
    world.popFromField(namespace, name, keyTuple, 0, byteLengthToPop, valueSchema);
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
    world.popFromField(namespace, name, keyTuple, 0, byteLengthToPop, valueSchema);
    endGasReport();

    // Expect the data to be updated
    loadedData = AddressArray.get(world, tableId, key);
    assertEq(loadedData.length, initData.length - 2);
    for (uint256 i; i < loadedData.length; i++) {
      assertEq(loadedData[i], initData[i]);
    }

    // Reset data
    world.setField(namespace, name, keyTuple, 0, encodedData, valueSchema);
    // Pop 2 items via direct access
    byteLengthToPop = 20 * 2;
    world.popFromField(tableId, keyTuple, 0, byteLengthToPop, valueSchema);
    // Expect the data to be updated
    loadedData = AddressArray.get(world, tableId, key);
    assertEq(loadedData.length, initData.length - 2);
    for (uint256 i; i < loadedData.length; i++) {
      assertEq(loadedData[i], initData[i]);
    }

    // Expect an error when trying to write from an address that doesn't have access (via namespace/name)
    _expectAccessDenied(address(0x01), namespace, name);
    world.popFromField(namespace, name, keyTuple, 0, 20, valueSchema);

    // Expect an error when trying to write from an address that doesn't have access (via tableId)
    _expectAccessDenied(address(0x01), namespace, name);
    world.popFromField(tableId, keyTuple, 0, 20, valueSchema);

    // Expect the World to have access
    vm.prank(address(world));
    world.popFromField(namespace, name, keyTuple, 0, 20, valueSchema);
  }

  function testUpdateInField() public {
    bytes16 namespace = "DynamicUpdTest";
    bytes16 name = "testTable";
    Schema valueSchema = AddressArray.getValueSchema();

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Update index 0
    address[] memory dataForUpdate = new address[](1);
    dataForUpdate[0] = address(bytes20(keccak256("address for update")));

    startGasReport("updateInField 1 item (cold)");
    world.updateInField(namespace, name, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate), valueSchema);
    endGasReport();

    startGasReport("updateInField 1 item (warm)");
    world.updateInField(namespace, name, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate), valueSchema);
    endGasReport();

    // Expect the data to be updated
    initData[0] = dataForUpdate[0];
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Update index 1 via direct access
    world.updateInField(tableId, keyTuple, 0, 20 * 1, EncodeArray.encode(dataForUpdate), valueSchema);

    // Expect the data to be updated
    initData[1] = dataForUpdate[0];
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Expect an error when trying to write from an address that doesn't have access (via namespace/name)
    _expectAccessDenied(address(0x01), namespace, name);
    world.updateInField(namespace, name, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate), valueSchema);

    // Expect an error when trying to write from an address that doesn't have access (via tableId)
    _expectAccessDenied(address(0x01), namespace, name);
    world.updateInField(tableId, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate), valueSchema);

    // Expect the World to have access
    vm.prank(address(world));
    world.updateInField(namespace, name, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate), valueSchema);
  }
}
