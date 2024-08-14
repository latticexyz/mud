// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { createWorld } from "@latticexyz/world/test/createWorld.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";

import { MetadataModule } from "../src/modules/metadata/MetadataModule.sol";
import { IWorld } from "../src/modules/metadata/codegen/world/IWorld.sol";
import { Resource as ResourceMetadata } from "../src/modules/metadata/codegen/tables/Resource.sol";

contract MetadataModuleTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  IWorld world;
  MetadataModule metadataModule = new MetadataModule();

  function setUp() public {
    world = IWorld(address(createWorld()));
    StoreSwitch.setStoreAddress(address(world));
  }

  function testInstall() public {
    startGasReport("install metadata module");
    world.installModule(metadataModule, new bytes(0));
    endGasReport();

    assertEq(NamespaceOwner.get(ResourceMetadata._tableId.getNamespaceId()), address(this));
  }

  // TODO: second install is idempotent
  // TODO: install with metadata namespace existing

  function testSetResourceMetadata() public {
    world.installModule(metadataModule, new bytes(0));

    assertEq(ResourceMetadata.get(ResourceMetadata._tableId, "label"), "");

    startGasReport("set resource metadata");
    world.metadata__setResource(ResourceMetadata._tableId, "label", "ResourceMetadata");
    endGasReport();

    assertEq(ResourceMetadata.get(ResourceMetadata._tableId, "label"), "ResourceMetadata");

    // TODO: can't set metadata in a namespace I don't own
    // TODO: can't set metadata for a non existent resource
    // TODO: can override label if it already is set
  }
}
