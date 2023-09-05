// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

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

  bytes16 namespace;
  bytes16 name;
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
    FieldLayout fieldLayout = AddressArray.getFieldLayout();
    Schema valueSchema = AddressArray.getValueSchema();

    // Initialize the data in setUp so that slots aren't warm in tests (to test cold update)

    namespace = "DynamicUpdTest";
    name = "testTable";
    tableId = ResourceSelector.from(namespace, name);

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
  function _expectAccessDenied(address _caller, bytes32 _tableId) internal {
    vm.prank(_caller);
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.AccessDenied.selector, _tableId.toString(), _caller));
  }

  function testPopFromField() public {
    FieldLayout fieldLayout = AddressArray.getFieldLayout();

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Pop 1 item
    uint256 byteLengthToPop = 20;

    startGasReport("pop 1 address (cold)");
    world.popFromField(tableId, keyTuple, 0, byteLengthToPop, fieldLayout);
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
    world.popFromField(tableId, keyTuple, 0, byteLengthToPop, fieldLayout);
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
    world.popFromField(tableId, keyTuple, 0, byteLengthToPop, fieldLayout);
    // Expect the data to be updated
    loadedData = AddressArray.get(world, tableId, key);
    assertEq(loadedData.length, initData.length - 2);
    for (uint256 i; i < loadedData.length; i++) {
      assertEq(loadedData[i], initData[i]);
    }

    // Expect an error when trying to write from an address that doesn't have access (via namespace/name)
    _expectAccessDenied(address(0x01), tableId);
    world.popFromField(tableId, keyTuple, 0, 20, fieldLayout);

    // Expect an error when trying to write from an address that doesn't have access (via tableId)
    _expectAccessDenied(address(0x01), tableId);
    world.popFromField(tableId, keyTuple, 0, 20, fieldLayout);

    // Expect the World to have access
    vm.prank(address(world));
    world.popFromField(tableId, keyTuple, 0, 20, fieldLayout);
  }

  function testUpdateInField() public {
    FieldLayout fieldLayout = AddressArray.getFieldLayout();

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Update index 0
    address[] memory dataForUpdate = new address[](1);
    dataForUpdate[0] = address(bytes20(keccak256("address for update")));

    startGasReport("updateInField 1 item (cold)");
    world.updateInField(tableId, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate), fieldLayout);
    endGasReport();

    startGasReport("updateInField 1 item (warm)");
    world.updateInField(tableId, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate), fieldLayout);
    endGasReport();

    // Expect the data to be updated
    initData[0] = dataForUpdate[0];
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Update index 1 via direct access
    world.updateInField(tableId, keyTuple, 0, 20 * 1, EncodeArray.encode(dataForUpdate), fieldLayout);

    // Expect the data to be updated
    initData[1] = dataForUpdate[0];
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Expect an error when trying to write from an address that doesn't have access (via namespace/name)
    _expectAccessDenied(address(0x01), tableId);
    world.updateInField(tableId, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate), fieldLayout);

    // Expect an error when trying to write from an address that doesn't have access (via tableId)
    _expectAccessDenied(address(0x01), tableId);
    world.updateInField(tableId, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate), fieldLayout);

    // Expect the World to have access
    vm.prank(address(world));
    world.updateInField(tableId, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate), fieldLayout);
  }
}
