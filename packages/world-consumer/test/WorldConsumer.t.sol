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
  bytes14 immutable namespace;
  constructor(IBaseWorld world, bytes14 _namespace) WorldConsumer(world) {
    namespace = _namespace;
  }

  function getStoreAddress() public view virtual returns (address) {
    return StoreSwitch.getStoreAddress();
  }

  function callableByAnyone() external view {}

  function onlyCallableByWorld() external view onlyWorld {}

  function onlyCallableByNamespace() external view onlyNamespace(namespace) {}

  function onlyCallableByNamespaceOwner() external view onlyNamespaceOwner(namespace) {}

  function payableFn() external payable returns (uint256 value) {
    return _msgValue();
  }
}

contract WorldConsumerTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  bytes14 constant namespace = "myNamespace";
  bytes16 constant systemName = "mySystem";

  ResourceId systemId;
  ResourceId namespaceId;

  IBaseWorld world;
  MockWorldConsumer mock;

  function setUp() public {
    world = createWorld();
    StoreSwitch.setStoreAddress(address(world));

    namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
    world.registerNamespace(namespaceId);

    systemId = WorldResourceIdLib.encode(RESOURCE_SYSTEM, namespace, systemName);

    mock = new MockWorldConsumer(world, namespace);
  }

  function testWorldConsumer() public view {
    assertEq(mock.getStoreAddress(), address(world));
  }

  // Test internal MUD access control
  function testAccessControl() public {
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

  function testOnlyNamespaceOwner() public {
    // Register the mock as a system with PUBLIC access
    world.registerSystem(systemId, mock, true);

    address alice = address(0x1234);

    vm.prank(alice);
    vm.expectRevert(abi.encodeWithSelector(WorldConsumer.WorldConsumer_CallerIsNotWorld.selector, world, alice));
    mock.onlyCallableByNamespaceOwner();

    vm.prank(alice);
    vm.expectRevert(
      abi.encodeWithSelector(WorldConsumer.WorldConsumer_CallerIsNotNamespaceOwner.selector, world, namespace, alice)
    );
    world.call(systemId, abi.encodeCall(mock.onlyCallableByNamespaceOwner, ()));

    // After granting access to namespace, it should not work
    world.grantAccess(namespaceId, alice);
    vm.prank(alice);
    vm.expectRevert(
      abi.encodeWithSelector(WorldConsumer.WorldConsumer_CallerIsNotNamespaceOwner.selector, world, namespace, alice)
    );
    world.call(systemId, abi.encodeCall(mock.onlyCallableByNamespaceOwner, ()));

    // After transfering namespace ownership, it should work
    world.transferOwnership(namespaceId, alice);
    vm.prank(alice);
    world.call(systemId, abi.encodeCall(mock.onlyCallableByNamespaceOwner, ()));
  }

  function testMsgValue() public {
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
