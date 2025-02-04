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

import { StoreConsumer } from "../src/experimental/StoreConsumer.sol";
import { WithStore } from "../src/experimental/WithStore.sol";
import { WithWorld } from "../src/experimental/WithWorld.sol";

abstract contract MockStoreConsumer is StoreConsumer {
  function getStoreAddress() public view virtual returns (address) {
    return StoreSwitch.getStoreAddress();
  }

  function encodeResourceId(bytes2 typeId, bytes16 name) public view returns (ResourceId) {
    return _encodeResourceId(typeId, name);
  }
}

contract MockWithStore is WithStore, MockStoreConsumer {
  constructor(address store) WithStore(store) {}
}

contract MockWithInternalStore is MockWithStore(address(this)) {}

contract MockWithWorld is WithWorld, MockStoreConsumer {
  constructor(
    IBaseWorld world,
    bytes14 namespace,
    bool registerNamespace
  ) WithWorld(world, namespace, registerNamespace) {}

  function grantNamespaceAccess(address to) external {
    getWorld().grantAccess(getNamespaceId(), to);
  }

  function transferNamespaceOwnership(address to) external {
    getWorld().transferOwnership(getNamespaceId(), to);
  }

  function callableByAnyone() external view {}

  function onlyCallableByWorld() external view onlyWorld {}

  function onlyCallableByNamespace() external view onlyNamespace {}
}

contract StoreConsumerTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  function testWithStore() public {
    MockWithStore mock = new MockWithStore(address(0xBEEF));
    assertEq(mock.getStoreAddress(), address(0xBEEF));
  }

  function testWithStoreInternal() public {
    MockWithInternalStore mock = new MockWithInternalStore();
    assertEq(mock.getStoreAddress(), address(mock));
  }

  function testWithWorld() public {
    IBaseWorld world = createWorld();
    bytes14 namespace = "myNamespace";
    MockWithWorld mock = new MockWithWorld(world, namespace, true);
    assertEq(mock.getStoreAddress(), address(world));

    StoreSwitch.setStoreAddress(address(world));

    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
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
    MockWithWorld mock = new MockWithWorld(world, namespace, true);
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
    MockWithWorld mock = new MockWithWorld(world, namespace, true);
    mock.transferNamespaceOwnership(address(this));

    // Register the mock as a system with PUBLIC access
    world.registerSystem(systemId, mock, true);

    address alice = address(0x1234);

    vm.prank(alice);
    vm.expectRevert(WithWorld.WithWorld_CallerIsNotWorld.selector);
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
    MockWithWorld mock = new MockWithWorld(world, namespace, true);
    mock.transferNamespaceOwnership(address(this));

    // Register the mock as a system with PUBLIC access
    world.registerSystem(systemId, mock, true);

    address alice = address(0x1234);

    vm.prank(alice);
    vm.expectRevert(WithWorld.WithWorld_CallerHasNoNamespaceAccess.selector);
    mock.onlyCallableByNamespace();

    vm.prank(alice);
    vm.expectRevert(WithWorld.WithWorld_CallerHasNoNamespaceAccess.selector);
    world.call(systemId, abi.encodeCall(mock.onlyCallableByNamespace, ()));

    // After granting access to namespace, it should work
    world.grantAccess(namespaceId, alice);
    vm.prank(alice);
    world.call(systemId, abi.encodeCall(mock.onlyCallableByNamespace, ()));
  }
}
