// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { Module } from "@latticexyz/world/src/Module.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";
import { RESOURCE_SYSTEM } from "@latticexyz/world/src/worldResourceTypes.sol";
import { REGISTRATION_SYSTEM_ID } from "@latticexyz/world/src/modules/init/constants.sol";
import { worldRegistrationSystem } from "@latticexyz/world/src/codegen/experimental/systems/WorldRegistrationSystemLib.sol";
import { storeRegistrationSystem } from "@latticexyz/world/src/codegen/experimental/systems/StoreRegistrationSystemLib.sol";

import { MetadataSystem } from "./MetadataSystem.sol";
import { metadataSystem } from "./codegen/experimental/systems/MetadataSystemLib.sol";
import { ResourceTag } from "./codegen/tables/ResourceTag.sol";

/**
 * @title MetadataModule
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Adds metadata tables and systems for annotating data in MUD apps.
 * For example, tagging resources with labels for better UX when reconstructing a MUD project from a world using onchain state.
 */
contract MetadataModule is Module {
  using WorldResourceIdInstance for ResourceId;

  MetadataSystem private immutable metadataSystemAddress = new MetadataSystem();

  function install(bytes memory args) public override {
    ResourceId namespace = ResourceTag._tableId.getNamespaceId();
    if (!ResourceIds.getExists(namespace)) {
      worldRegistrationSystem.callFrom(_msgSender()).registerNamespace(namespace);
    }
    AccessControl.requireOwner(namespace, _msgSender());

    if (!ResourceIds.getExists(ResourceTag._tableId)) {
      // TODO: add a `ResourceTag.getTableDef()` that returns a struct that can be used to register?
      storeRegistrationSystem.callFrom(_msgSender()).registerTable(
        ResourceTag._tableId,
        ResourceTag._fieldLayout,
        ResourceTag._keySchema,
        ResourceTag._valueSchema,
        ResourceTag.getKeyNames(),
        ResourceTag.getFieldNames()
      );
    }

    ResourceId metadataSystemId = metadataSystem.toResourceId();

    if (!ResourceIds.getExists(metadataSystemId)) {
      worldRegistrationSystem.callFrom(_msgSender()).registerSystem(metadataSystemId, metadataSystemAddress, true);
      worldRegistrationSystem.callFrom(_msgSender()).registerFunctionSelector(
        metadataSystemId,
        "getResourceTag(bytes32,bytes32)"
      );
      worldRegistrationSystem.callFrom(_msgSender()).registerFunctionSelector(
        metadataSystemId,
        "setResourceTag(bytes32,bytes32,bytes)"
      );
      worldRegistrationSystem.callFrom(_msgSender()).registerFunctionSelector(
        metadataSystemId,
        "deleteResourceTag(bytes32,bytes32)"
      );
    } else if (metadataSystem.getAddress() != address(metadataSystemAddress)) {
      // upgrade system
      worldRegistrationSystem.callFrom(_msgSender()).registerSystem(metadataSystemId, metadataSystemAddress, true);
    }
  }
}
