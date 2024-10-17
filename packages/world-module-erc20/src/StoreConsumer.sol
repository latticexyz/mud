// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { StoreCore } from "@latticexyz/store/src/Store.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { RESOURCE_TABLE, RESOURCE_OFFCHAIN_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/index.sol";
import { ResourceId, ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { ResourceAccess } from "@latticexyz/world/src/codegen/tables/ResourceAccess.sol";
import { WorldResourceIdLib, TYPE_BITS, NAME_BITS, NAMESPACE_BITS } from "@latticexyz/world/src/WorldResourceId.sol";
import { WorldContextConsumerLib } from "@latticexyz/world/src/WorldContext.sol";

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

abstract contract WithNamespace is WithStore {
  bytes14 public immutable NAMESPACE;

  error NamespaceAlreadyExists(bytes14 namespace);
  error CallerHasNoNamespaceAccess();

  modifier onlyNamespace() {
    address sender = _msgSender();
    if (!ResourceAccess.get(getNamespaceId(), sender)) {
      revert CallerHasNoNamespaceAccess();
    }
    _;
  }

  constructor(IBaseWorld world, bytes14 namespace) WithStore(address(world)) {
    NAMESPACE = namespace;

    ResourceId namespaceId = getNamespaceId();

    if (ResourceIds.getExists(namespaceId)) {
      revert NamespaceAlreadyExists(namespace);
    }

    world.registerNamespace(namespaceId);
  }

  function getNamespaceId() public view returns (ResourceId) {
    return WorldResourceIdLib.encodeNamespace(NAMESPACE);
  }

  function _encodeResourceId(bytes2 typeId, bytes16 name) internal view virtual override returns (ResourceId) {
    return WorldResourceIdLib.encode(typeId, NAMESPACE, name);
  }
}
