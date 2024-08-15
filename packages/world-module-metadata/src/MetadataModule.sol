// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { Module } from "@latticexyz/world/src/Module.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { MetadataSystem } from "./MetadataSystem.sol";
import { ResourceTag } from "./codegen/tables/ResourceTag.sol";

/**
 * @title MetadataModule
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Adds metadata tables and systems for annotating data in MUD apps.
 * For example, tagging resources with labels for better UX when reconstructing a MUD project from a world using onchain state.
 */
contract MetadataModule is Module {
  using WorldResourceIdInstance for ResourceId;

  MetadataSystem private immutable metadataSystem = new MetadataSystem();

  function installRoot(bytes memory) public pure {
    revert Module_RootInstallNotSupported();
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    ResourceId namespace = ResourceTag._tableId.getNamespaceId();
    if (!ResourceIds.getExists(namespace)) {
      world.registerNamespace(namespace);
    }
    AccessControl.requireOwner(namespace, address(this));

    if (!ResourceIds.getExists(ResourceTag._tableId)) {
      ResourceTag.register();
    }

    ResourceId metadataSystemId = WorldResourceIdLib.encode(
      RESOURCE_SYSTEM,
      namespace.getNamespace(),
      "MetadataSystem"
    );
    // TODO: add support for upgrading system and registering new function selectors
    if (!ResourceIds.getExists(metadataSystemId)) {
      world.registerSystem(metadataSystemId, metadataSystem, true);
      world.registerFunctionSelector(metadataSystemId, "getResourceTag(bytes32,bytes32)");
      world.registerFunctionSelector(metadataSystemId, "setResourceTag(bytes32,bytes32,bytes)");
      world.registerFunctionSelector(metadataSystemId, "deleteResourceTag(bytes32,bytes32)");
    }

    world.transferOwnership(namespace, _msgSender());
  }
}
