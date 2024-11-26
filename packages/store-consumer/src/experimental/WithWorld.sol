// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

import { WithStore } from "./WithStore.sol";

abstract contract WithWorld is WithStore {
  bytes14 public immutable namespace;

  error WithWorld_RootNamespaceNotAllowed();
  error WithWorld_NamespaceAlreadyExists();
  error WithWorld_NamespaceDoesNotExists();
  error WithWorld_CallerHasNoNamespaceAccess();

  modifier onlyNamespace() {
    address sender = _msgSender();
    if (!ResourceAccess.get(getNamespaceId(), sender)) {
      revert WithWorld_CallerHasNoNamespaceAccess();
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
        revert WithWorld_NamespaceAlreadyExists();
      }

      _world.registerNamespace(namespaceId);
    } else if (!namespaceExists) {
      revert WithWorld_NamespaceDoesNotExists();
    }
  }

  function getNamespaceId() public view returns (ResourceId) {
    return WorldResourceIdLib.encodeNamespace(namespace);
  }

  function getWorld() public view returns (IBaseWorld) {
    return IBaseWorld(getStore());
  }

  function _encodeResourceId(bytes2 typeId, bytes16 name) internal view virtual override returns (ResourceId) {
    return WorldResourceIdLib.encode(typeId, namespace, name);
  }
}
