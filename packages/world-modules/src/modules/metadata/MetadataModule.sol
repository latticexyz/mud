// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { Module } from "@latticexyz/world/src/Module.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { MetadataSystem } from "./MetadataSystem.sol";
import { Metadata } from "./codegen/tables/Metadata.sol";

contract MetadataModule is Module {
  using WorldResourceIdInstance for ResourceId;

  MetadataSystem private immutable metadataSystem = new MetadataSystem();
  ResourceId private immutable metadataSystemId =
    WorldResourceIdLib.encode(RESOURCE_SYSTEM, Metadata._tableId.getNamespace(), "MetadataSystem");

  function installRoot(bytes memory) public pure {
    revert Module_RootInstallNotSupported();
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    ResourceId namespace = Metadata._tableId.getNamespaceId();
    if (!ResourceIds.getExists(namespace)) {
      world.registerNamespace(namespace);
    }

    if (NamespaceOwner.getOwner(namespace) == _msgSender()) {
      if (!ResourceIds.getExists(Metadata._tableId)) {
        Metadata.register();
      }
      if (!ResourceIds.getExists(metadataSystemId)) {
        world.registerSystem(metadataSystemId, metadataSystem, true);
        world.registerFunctionSelector(metadataSystemId, "setMetadata(bytes32,bytes32,string)");
      }
    }
  }
}
