// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";

import { World } from "../src/World.sol";
import { System } from "../src/System.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";
import { ROOT_NAMESPACE, ROOT_FILE } from "../src/constants.sol";

import { NamespaceOwner } from "../src/tables/NamespaceOwner.sol";
import { ResourceAccess } from "../src/tables/ResourceAccess.sol";
import { Systems } from "../src/tables/Systems.sol";
import { Bool } from "../src/tables/Bool.sol";
import { AddressArray } from "../src/tables/AddressArray.sol";

import { CoreModule } from "../src/modules/core/CoreModule.sol";
import { RegistrationModule } from "../src/modules/registration/RegistrationModule.sol";
import { DynamicPartialModule } from "../src/modules/dynamicpartial/DynamicPartialModule.sol";

import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IErrors } from "../src/interfaces/IErrors.sol";

contract UpdateInFieldTest is Test {
  using ResourceSelector for bytes32;

  event HookCalled(bytes data);
  event WorldTestSystemLog(string log);

  Schema defaultKeySchema = SchemaLib.encode(SchemaType.BYTES32);
  IBaseWorld world;

  bytes32 key;
  bytes32[] keyTuple;
  bytes32[] singletonKey;

  uint256 tableId;

  function setUp() public {
    world = IBaseWorld(address(new World()));
    world.installRootModule(new CoreModule(), new bytes(0));
    world.installRootModule(new RegistrationModule(), new bytes(0));
    world.installRootModule(new DynamicPartialModule(), new bytes(0));

    key = "testKey";
    keyTuple = new bytes32[](1);
    keyTuple[0] = key;
    singletonKey = new bytes32[](0);

    // Initialize the data in setUp so that slots aren't warm in tests (to test cold update)

    bytes16 namespace = "testUpdInField";
    bytes16 file = "testTable";

    // Register a new table
    bytes32 resourceSelector = world.registerTable(namespace, file, AddressArray.getSchema(), defaultKeySchema);
    tableId = uint256(resourceSelector);

    // Create data
    address[] memory initData = new address[](3);
    initData[0] = address(0x01);
    initData[1] = address(bytes20(keccak256("some address")));
    initData[2] = address(bytes20(keccak256("another address")));
    bytes memory encodedData = EncodeArray.encode(initData);

    world.setField(namespace, file, keyTuple, 0, encodedData);
  }

  // Expect an error when trying to write from an address that doesn't have access
  function _expectAccessDenied(address caller, bytes16 namespace, bytes16 file) internal {
    vm.prank(caller);
    vm.expectRevert(
      abi.encodeWithSelector(IErrors.AccessDenied.selector, ResourceSelector.from(namespace, file).toString(), caller)
    );
  }

  function testUpdateInField() public {
    bytes16 namespace = "testUpdInField";
    bytes16 file = "testTable";

    // Create data
    address[] memory initData = new address[](3);
    initData[0] = address(0x01);
    initData[1] = address(bytes20(keccak256("some address")));
    initData[2] = address(bytes20(keccak256("another address")));
    bytes memory encodedData = EncodeArray.encode(initData);

    // Expect the data to be written
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Update index 0
    address[] memory dataForUpdate = new address[](1);
    dataForUpdate[0] = address(bytes20(keccak256("address for update")));
    // !gasreport updateInField 1 item (cold)
    world.updateInField(namespace, file, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate));
    // !gasreport updateInField 1 item (warm)
    world.updateInField(namespace, file, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate));

    // Expect the data to be updated
    initData[0] = dataForUpdate[0];
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Update index 1 via direct access
    world.updateInField(tableId, keyTuple, 0, 20 * 1, EncodeArray.encode(dataForUpdate));

    // Expect the data to be updated
    initData[1] = dataForUpdate[0];
    assertEq(AddressArray.get(world, tableId, key), initData);

    // Expect an error when trying to write from an address that doesn't have access (via namespace/file)
    _expectAccessDenied(address(0x01), namespace, file);
    world.updateInField(namespace, file, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate));

    // Expect an error when trying to write from an address that doesn't have access (via tableId)
    _expectAccessDenied(address(0x01), namespace, file);
    world.updateInField(tableId, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate));

    // Expect the World to have access
    vm.prank(address(world));
    world.updateInField(namespace, file, keyTuple, 0, 0, EncodeArray.encode(dataForUpdate));
  }
}
