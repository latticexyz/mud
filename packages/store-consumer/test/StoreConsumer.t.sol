// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { console } from "forge-std/console.sol";

import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
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

  function onlyCallableByNamespace() external view onlyNamespace {}
}

contract StoreConsumerTest is Test, GasReporter {
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

  function testOnlyNamespace() public {
    IBaseWorld world = createWorld();
    StoreSwitch.setStoreAddress(address(world));

    bytes14 namespace = "myNamespace";
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(namespace);
    MockWithWorld mock = new MockWithWorld(world, namespace, true);
    mock.transferNamespaceOwnership(address(this));

    address alice = address(0x1234);

    vm.prank(alice);
    vm.expectRevert();
    mock.onlyCallableByNamespace();

    world.grantAccess(namespaceId, alice);
    vm.prank(alice);
    mock.onlyCallableByNamespace();
  }
}
