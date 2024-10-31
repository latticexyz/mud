// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

import { WithStore } from "./WithStore.sol";

abstract contract WithWorld is WithStore {
  bytes14 public immutable namespace;

  error WithWorld_CallerHasNoNamespaceAccess();

  modifier onlyNamespace() {
    address sender = _msgSender();
    if (!ResourceAccess.get(getNamespaceId(), sender)) {
      revert WithWorld_CallerHasNoNamespaceAccess();
    }
    _;
  }

  constructor(IBaseWorld world, bytes14 _namespace) WithStore(address(world)) {
    namespace = _namespace;

    // This will revert if namespace already exists
    world.registerNamespace(getNamespaceId());
  }

  function getNamespaceId() public view returns (ResourceId) {
    return WorldResourceIdLib.encodeNamespace(namespace);
  }

  function _encodeResourceId(bytes2 typeId, bytes16 name) internal view virtual override returns (ResourceId) {
    return WorldResourceIdLib.encode(typeId, namespace, name);
  }
}
