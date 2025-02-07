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
  ResourceId public immutable namespaceId;

  error WorldConsumer_RootNamespaceNotAllowed(address worldAddress);
  error WorldConsumer_NamespaceAlreadyExists(address worldAddress, bytes14 namespace);
  error WorldConsumer_NamespaceDoesNotExists(address worldAddress, bytes14 namespace);
  error WorldConsumer_CallerHasNoNamespaceAccess(address worldAddress, bytes14 namespace, address caller);
  error WorldConsumer_CallerIsNotWorld(address worldAddress, address caller);
  error WorldConsumer_ValueNotAllowed(address worldAddress);

  modifier onlyWorld() {
    address world = _world();
    if (world != msg.sender) {
      revert WorldConsumer_CallerIsNotWorld(world, msg.sender);
    }
    _;
  }

  modifier onlyNamespace() {
    address world = _world();
    if (world != msg.sender) {
      revert WorldConsumer_CallerIsNotWorld(world, msg.sender);
    }

    // We use WorldContextConsumer directly as we already know the world is the caller
    address sender = WorldContextConsumer._msgSender();
    if (!ResourceAccess.get(namespaceId, sender)) {
      revert WorldConsumer_CallerHasNoNamespaceAccess(world, namespace, sender);
    }

    _;
  }

  constructor(IBaseWorld _world, bytes14 _namespace, bool registerNamespace) {
    address worldAddress = address(_world);
    StoreSwitch.setStoreAddress(worldAddress);

    if (_namespace == bytes14(0)) {
      revert WorldConsumer_RootNamespaceNotAllowed(worldAddress);
    }

    namespace = _namespace;
    namespaceId = WorldResourceIdLib.encodeNamespace(_namespace);
    bool namespaceExists = ResourceIds.getExists(namespaceId);

    if (registerNamespace) {
      if (namespaceExists) {
        revert WorldConsumer_NamespaceAlreadyExists(worldAddress, _namespace);
      }
      _world.registerNamespace(namespaceId);
    } else if (!namespaceExists) {
      revert WorldConsumer_NamespaceDoesNotExists(worldAddress, _namespace);
    }
  }

  function _msgSender() public view virtual override returns (address sender) {
    return _world() == msg.sender ? WorldContextConsumer._msgSender() : msg.sender;
  }

  function _msgValue() public view virtual override returns (uint256 value) {
    address world = _world();
    if (world != msg.sender) {
      revert WorldConsumer_ValueNotAllowed(world);
    }

    return WorldContextConsumer._msgValue();
  }
}
