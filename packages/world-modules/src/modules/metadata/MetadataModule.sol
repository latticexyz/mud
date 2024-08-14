// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { Module } from "@latticexyz/world/src/Module.sol";
import { AccessControlLib } from "../../utils/AccessControlLib.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";

import { MetadataSystem } from "./MetadataSystem.sol";
import { Resource as ResourceMetadata } from "./codegen/tables/Resource.sol";

// TODO: docs on intended use (optional module, default installed, labels are optional for UX)

contract MetadataModule is Module {
  using WorldResourceIdInstance for ResourceId;

  MetadataSystem private immutable metadataSystem = new MetadataSystem();

  function installRoot(bytes memory) public pure {
    revert Module_RootInstallNotSupported();
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    ResourceId namespace = ResourceMetadata._tableId.getNamespaceId();
    if (!ResourceIds.getExists(namespace)) {
      world.registerNamespace(namespace);
    }

    AccessControlLib.requireOwner(namespace, address(this));

    if (!ResourceIds.getExists(ResourceMetadata._tableId)) {
      ResourceMetadata.register();
    }

    ResourceId metadataSystemId = WorldResourceIdLib.encode(
      RESOURCE_SYSTEM,
      namespace.getNamespace(),
      "MetadataSystem"
    );
    if (!ResourceIds.getExists(metadataSystemId)) {
      world.registerSystem(metadataSystemId, metadataSystem, true);
      world.registerFunctionSelector(metadataSystemId, "setResource(bytes32,bytes32,string)");
    }

    world.transferOwnership(namespace, _msgSender());
  }
}
