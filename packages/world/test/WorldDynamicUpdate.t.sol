// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";

import { World } from "../src/World.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";

import { NamespaceOwner } from "../src/tables/NamespaceOwner.sol";
import { ResourceAccess } from "../src/tables/ResourceAccess.sol";
import { AddressArray } from "./tables/AddressArray.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";

import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";

contract UpdateInFieldTest is Test {
  using ResourceSelector for bytes32;

  event HookCalled(bytes data);
  event WorldTestSystemLog(string log);

  Schema internal defaultKeySchema = SchemaLib.encode(SchemaType.BYTES32);
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

    // Initialize the data in setUp so that slots aren't warm in tests (to test cold update)

    bytes16 namespace = "DynamicUpdTest";
    bytes16 name = "testTable";

    // Register a new table
    tableId = world.registerTable(namespace, name, AddressArray.getSchema(), defaultKeySchema);

    // Create data
    initData = new address[](3);
    initData[0] = address(0x01);
    initData[1] = address(bytes20(keccak256("some address")));
    initData[2] = address(bytes20(keccak256("another address")));
    encodedData = EncodeArray.encode(initData);

    world.setField(namespace, name, keyTuple, 0, encodedData);
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

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Pop 1 item
    uint256 byteLengthToPop = 20;
    // !gasreport pop 1 address (cold)
    world.popFromField(namespace, name, keyTuple, 0, byteLengthToPop);
    // Expect the data to be updated
    address[] memory loadedData = AddressArray.get(world, tableId, key);
    assertEq(loadedData.length, initData.length - 1);
    for (uint256 i; i < loadedData.length; i++) {
      assertEq(loadedData[i], initData[i]);
    }

    // Pop 1 more item
    byteLengthToPop = 20;
    // !gasreport pop 1 address (warm)
    world.popFromField(namespace, name, keyTuple, 0, byteLengthToPop);
    // Expect the data to be updated
    loadedData = AddressArray.get(world, tableId, key);
    assertEq(loadedData.length, initData.length - 2);
    for (uint256 i; i < loadedData.length; i++) {
      assertEq(loadedData[i], initData[i]);
    }

    // Reset data
    world.setField(namespace, name, keyTuple, 0, encodedData);
    // Pop 2 items via direct access
    byteLengthToPop = 20 * 2;
    world.popFromField(tableId, keyTuple, 0, byteLengthToPop);
    // Expect the data to be updated
    loadedData = AddressArray.get(world, tableId, key);
    assertEq(loadedData.length, initData.length - 2);
    for (uint256 i; i < loadedData.length; i++) {
      assertEq(loadedData[i], initData[i]);
    }

    // Expect an error when trying to write from an address that doesn't have access (via namespace/name)
    _expectAccessDenied(address(0x01), namespace, name);
    world.popFromField(namespace, name, keyTuple, 0, 20);

    // Expect an error when trying to write from an address that doesn't have access (via tableId)
    _expectAccessDenied(address(0x01), namespace, name);
    world.popFromField(tableId, keyTuple, 0, 20);

    // Expect the World to have access
    vm.prank(address(world));
    world.popFromField(namespace, name, keyTuple, 0, 20);
  }

  function testUpdateInField() public {
    bytes16 namespace = "DynamicUpdTest";
    bytes16 name = "testTable";

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Update index 0
    address[] memory dataForUpdate = new address[](1);
    dataForUpdate[0] = address(bytes20(keccak256("address for update")));
    // !gasreport updateInField 1 item (cold)
    world.updateInField(namespace, name, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate));
    // !gasreport updateInField 1 item (warm)
    world.updateInField(namespace, name, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate));

    // Expect the data to be updated
    initData[0] = dataForUpdate[0];
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Update index 1 via direct access
    world.updateInField(tableId, keyTuple, 0, 20 * 1, EncodeArray.encode(dataForUpdate));

    // Expect the data to be updated
    initData[1] = dataForUpdate[0];
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Expect an error when trying to write from an address that doesn't have access (via namespace/name)
    _expectAccessDenied(address(0x01), namespace, name);
    world.updateInField(namespace, name, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate));

    // Expect an error when trying to write from an address that doesn't have access (via tableId)
    _expectAccessDenied(address(0x01), namespace, name);
    world.updateInField(tableId, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate));

    // Expect the World to have access
    vm.prank(address(world));
    world.updateInField(namespace, name, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate));
  }
}
