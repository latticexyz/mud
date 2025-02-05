// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { WorldContextConsumer } from "@latticexyz/world/src/WorldContext.sol";
import { System } from "@latticexyz/world/src/System.sol";

import { Context } from "./Context.sol";
import { WithStore } from "./WithStore.sol";

abstract contract WithWorld is WithStore, System {
  bytes14 public immutable namespace;

  error WithWorld_RootNamespaceNotAllowed();
  error WithWorld_NamespaceAlreadyExists(bytes14 namespace);
  error WithWorld_NamespaceDoesNotExists(bytes14 namespace);
  error WithWorld_CallerHasNoNamespaceAccess(bytes14 namespace, address caller);
  error WithWorld_CallerIsNotWorld(address caller);

  modifier onlyWorld() {
    if (!_callerIsWorld()) {
      revert WithWorld_CallerIsNotWorld(msg.sender);
    }
    _;
  }

  modifier onlyNamespace() {
    // We use WorldContextConsumer directly as we already know the world is the caller
    if (!_callerIsWorld() || !ResourceAccess.get(getNamespaceId(), WorldContextConsumer._msgSender())) {
      revert WithWorld_CallerHasNoNamespaceAccess(namespace, _msgSender());
    }
    _;
  }

  constructor(IBaseWorld _world, bytes14 _namespace, bool registerNamespace) WithStore(address(_world)) {
    if (_namespace == bytes14(0)) {
      revert WithWorld_RootNamespaceNotAllowed();
    }

    namespace = _namespace;

    ResourceId namespaceId = getNamespaceId();

    bool namespaceExists = ResourceIds.getExists(namespaceId);

    if (registerNamespace) {
      if (namespaceExists) {
        revert WithWorld_NamespaceAlreadyExists(_namespace);
      }

      _world.registerNamespace(namespaceId);
    } else if (!namespaceExists) {
      revert WithWorld_NamespaceDoesNotExists(_namespace);
    }
  }

  function getNamespaceId() public view returns (ResourceId) {
    return WorldResourceIdLib.encodeNamespace(namespace);
  }

  function getWorld() public view returns (IBaseWorld) {
    return IBaseWorld(getStore());
  }

  function _msgSender() public view virtual override(Context, WorldContextConsumer) returns (address sender) {
    return _callerIsWorld() ? WorldContextConsumer._msgSender() : Context._msgSender();
  }

  function _callerIsWorld() internal view returns (bool) {
    return msg.sender == address(getWorld());
  }

  function _encodeResourceId(bytes2 typeId, bytes16 name) internal view virtual override returns (ResourceId) {
    return WorldResourceIdLib.encode(typeId, namespace, name);
  }
}
