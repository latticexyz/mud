// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { RESOURCE_TABLE, RESOURCE_OFFCHAIN_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { WorldContextConsumer } from "@latticexyz/world/src/WorldContext.sol";
import { System } from "@latticexyz/world/src/System.sol";

abstract contract WorldConsumer is System {
  bytes14 public immutable namespace;

  error WorldConsumer_RootNamespaceNotAllowed(IBaseWorld world);
  error WorldConsumer_NamespaceAlreadyExists(IBaseWorld world, bytes14 namespace);
  error WorldConsumer_NamespaceDoesNotExists(IBaseWorld world, bytes14 namespace);
  error WorldConsumer_CallerHasNoNamespaceAccess(IBaseWorld world, bytes14 namespace, address caller);
  error WorldConsumer_CallerIsNotWorld(IBaseWorld world, address caller);
  error WorldConsumer_ValueNotAllowed(IBaseWorld world);

  modifier onlyWorld() {
    IBaseWorld world = getWorld();
    if (address(world) != msg.sender) {
      revert WorldConsumer_CallerIsNotWorld(world, msg.sender);
    }
    _;
  }

  modifier onlyNamespace() {
    IBaseWorld world = getWorld();
    if (address(world) != msg.sender) {
      revert WorldConsumer_CallerIsNotWorld(world, msg.sender);
    }

    // We use WorldContextConsumer directly as we already know the world is the caller
    address sender = WorldContextConsumer._msgSender();
    if (!ResourceAccess.get(getNamespaceId(), sender)) {
      revert WorldConsumer_CallerHasNoNamespaceAccess(world, namespace, sender);
    }

    _;
  }

  constructor(IBaseWorld _world, bytes14 _namespace, bool registerNamespace) {
    StoreSwitch.setStoreAddress(address(_world));

    if (_namespace == bytes14(0)) {
      revert WorldConsumer_RootNamespaceNotAllowed(_world);
    }

    namespace = _namespace;

    if (registerNamespace) {
      _registerNamespace(_world, _namespace);
    } else {
      _validateExistingNamespace(_world, _namespace);
    }
  }

  function getNamespaceId() public view returns (ResourceId) {
    return WorldResourceIdLib.encodeNamespace(namespace);
  }

  function getWorld() public view returns (IBaseWorld) {
    return IBaseWorld(StoreSwitch.getStoreAddress());
  }

  function _msgSender() public view virtual override returns (address sender) {
    return address(getWorld()) == msg.sender ? WorldContextConsumer._msgSender() : msg.sender;
  }

  function _msgValue() public view virtual override returns (uint256 value) {
    IBaseWorld world = getWorld();
    if (address(world) != msg.sender) {
      revert WorldConsumer_ValueNotAllowed(world);
    }

    return WorldContextConsumer._msgValue();
  }

  function _encodeTableId(bytes16 name) internal view returns (ResourceId) {
    return WorldResourceIdLib.encode(RESOURCE_TABLE, namespace, name);
  }

  function _encodeOffchainTableId(bytes16 name) internal view returns (ResourceId) {
    return WorldResourceIdLib.encode(RESOURCE_OFFCHAIN_TABLE, namespace, name);
  }

  function _registerNamespace(IBaseWorld _world, bytes14 _namespace) internal {
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(_namespace);
    if (ResourceIds.getExists(namespaceId)) {
      revert WorldConsumer_NamespaceAlreadyExists(_world, _namespace);
    }
    _world.registerNamespace(namespaceId);
  }

  function _validateExistingNamespace(IBaseWorld _world, bytes14 _namespace) internal view {
    ResourceId namespaceId = WorldResourceIdLib.encodeNamespace(_namespace);
    if (!ResourceIds.getExists(namespaceId)) {
      revert WorldConsumer_NamespaceDoesNotExists(_world, _namespace);
    }
  }
}
