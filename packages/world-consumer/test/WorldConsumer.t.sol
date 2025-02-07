// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { createWorld } from "@latticexyz/world/test/createWorld.sol";

import { ResourceId, ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";
import { Tables, ResourceIds } from "@latticexyz/store/src/codegen/index.sol";
import { StoreCore } from "@latticexyz/store/src/Store.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { WorldConsumer } from "../src/experimental/WorldConsumer.sol";

contract MockWorldConsumer is WorldConsumer {
  constructor(
    IBaseWorld world,
    bytes14 namespace,
    bool registerNamespace
  ) WorldConsumer(world, namespace, registerNamespace) {}

  function getStoreAddress() public view virtual returns (address) {
    return StoreSwitch.getStoreAddress();
  }

  function grantNamespaceAccess(address to) external {
    IBaseWorld(_world()).grantAccess(namespaceId, to);
  }

  function transferNamespaceOwnership(address to) external {
    IBaseWorld(_world()).transferOwnership(namespaceId, to);
  }

  function callableByAnyone() external view {}

  function onlyCallableByWorld() external view onlyWorld {}

  function onlyCallableByNamespace() external view onlyNamespace {}

  function payableFn() external payable returns (uint256 value) {
    return _msgValue();
  }
}

contract WorldConsumerTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  function testWorldConsumer() public {
    IBaseWorld world = createWorld();
    bytes14 namespace = "myNamespace";
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);

    MockWorldConsumer mock = new MockWorldConsumer(world, namespace, true);
    assertEq(mock.getStoreAddress(), address(world));
    assertEq(mock.namespace(), namespace);
    assertEq(mock.namespaceId().unwrap(), namespaceId.unwrap());

    StoreSwitch.setStoreAddress(address(world));

    assertTrue(ResourceIds.getExists(namespaceId), "Namespace not registered");
  }

  // Test internal MUD access control
  function testAccessControl() public {
    IBaseWorld world = createWorld();
    StoreSwitch.setStoreAddress(address(world));

    bytes16 systemName = "mySystem";
    bytes14 namespace = "myNamespace";
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
    ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, namespace, systemName);
    MockWorldConsumer mock = new MockWorldConsumer(world, namespace, true);
    mock.transferNamespaceOwnership(address(this));

    // Register the mock as a system with PRIVATE access
    world.registerSystem(systemId, mock, false);

    address alice = address(0x1234);

    vm.prank(alice);
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.World_AccessDenied.selector, systemId.toString(), alice));
    world.call(systemId, abi.encodeCall(mock.callableByAnyone, ()));

    // After granting access to namespace, it should work
    world.grantAccess(namespaceId, alice);
    vm.prank(alice);
    world.call(systemId, abi.encodeCall(mock.callableByAnyone, ()));
  }

  function testOnlyWorld() public {
    IBaseWorld world = createWorld();
    StoreSwitch.setStoreAddress(address(world));

    bytes16 systemName = "mySystem";
    bytes14 namespace = "myNamespace";
    ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, namespace, systemName);
    MockWorldConsumer mock = new MockWorldConsumer(world, namespace, true);
    mock.transferNamespaceOwnership(address(this));

    // Register the mock as a system with PUBLIC access
    world.registerSystem(systemId, mock, true);

    address alice = address(0x1234);

    vm.prank(alice);
    vm.expectRevert(abi.encodeWithSelector(WorldConsumer.WorldConsumer_CallerIsNotWorld.selector, world, alice));
    mock.onlyCallableByWorld();

    vm.prank(alice);
    world.call(systemId, abi.encodeCall(mock.onlyCallableByWorld, ()));
  }

  function testOnlyNamespace() public {
    IBaseWorld world = createWorld();
    StoreSwitch.setStoreAddress(address(world));

    bytes16 systemName = "mySystem";
    bytes14 namespace = "myNamespace";
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
    ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, namespace, systemName);
    MockWorldConsumer mock = new MockWorldConsumer(world, namespace, true);
    mock.transferNamespaceOwnership(address(this));

    // Register the mock as a system with PUBLIC access
    world.registerSystem(systemId, mock, true);

    address alice = address(0x1234);

    vm.prank(alice);
    vm.expectRevert(abi.encodeWithSelector(WorldConsumer.WorldConsumer_CallerIsNotWorld.selector, world, alice));
    mock.onlyCallableByNamespace();

    vm.prank(alice);
    vm.expectRevert(
      abi.encodeWithSelector(WorldConsumer.WorldConsumer_CallerHasNoNamespaceAccess.selector, world, namespace, alice)
    );
    world.call(systemId, abi.encodeCall(mock.onlyCallableByNamespace, ()));

    // After granting access to namespace, it should work
    world.grantAccess(namespaceId, alice);
    vm.prank(alice);
    world.call(systemId, abi.encodeCall(mock.onlyCallableByNamespace, ()));
  }

  function testMsgValue() public {
    IBaseWorld world = createWorld();
    StoreSwitch.setStoreAddress(address(world));

    bytes16 systemName = "mySystem";
    bytes14 namespace = "myNamespace";
    ResourceId systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, namespace, systemName);
    MockWorldConsumer mock = new MockWorldConsumer(world, namespace, true);
    mock.transferNamespaceOwnership(address(this));

    // Register the mock as a system with PUBLIC access
    world.registerSystem(systemId, mock, true);

    address alice = address(0x1234);
    vm.deal(alice, 1);

    vm.prank(alice);
    vm.expectRevert(abi.encodeWithSelector(WorldConsumer.WorldConsumer_ValueNotAllowed.selector, world));
    mock.payableFn{ value: 1 }();

    vm.prank(alice);
    bytes memory result = world.call{ value: 1 }(systemId, abi.encodeCall(mock.payableFn, ()));
    uint256 value = abi.decode(result, (uint256));
    assertEq(value, 1);
  }
}
