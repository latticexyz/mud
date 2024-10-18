// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { StoreCore } from "@latticexyz/store/src/Store.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { RESOURCE_TABLE, RESOURCE_OFFCHAIN_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { ResourceId, ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";

import { Context } from "./Context.sol";

abstract contract StoreConsumer {
  function getStore() public view returns (address) {
    return StoreSwitch.getStoreAddress();
  }

  function _encodeResourceId(bytes2 typeId, bytes16 name) internal view virtual returns (ResourceId);

  function _encodeTableId(bytes16 name) internal view returns (ResourceId) {
    return _encodeResourceId(RESOURCE_TABLE, name);
  }

  function _encodeOffchainTableId(bytes16 name) internal view returns (ResourceId) {
    return _encodeResourceId(RESOURCE_OFFCHAIN_TABLE, name);
  }
}

abstract contract WithStore is Context, StoreConsumer {
  constructor(address store) {
    StoreSwitch.setStoreAddress(store);

    if (store == address(this)) {
      StoreCore.registerInternalTables();
    }
  }

  function _encodeResourceId(bytes2 typeId, bytes16 name) internal view virtual override returns (ResourceId) {
    return ResourceIdLib.encode(typeId, name);
  }
}

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

    ResourceId namespaceId = getNamespaceId();

    // This will revert if namespace already exists
    world.registerNamespace(namespaceId);
  }

  function getNamespaceId() public view returns (ResourceId) {
    return WorldResourceIdLib.encodeNamespace(namespace);
  }

  function _encodeResourceId(bytes2 typeId, bytes16 name) internal view virtual override returns (ResourceId) {
    return WorldResourceIdLib.encode(typeId, namespace, name);
  }
}
