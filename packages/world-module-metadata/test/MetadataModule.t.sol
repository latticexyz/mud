// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { createWorld } from "@latticexyz/world/test/createWorld.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";

import { MetadataModule } from "../src/MetadataModule.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Resource as ResourceMetadata } from "../src/codegen/tables/Resource.sol";

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

    ResourceId namespace = ResourceMetadata._tableId.getNamespaceId();
    assertEq(NamespaceOwner.get(namespace), address(this));

    // Installing again will revert because metadata namespace isn't owned by the module, so the module is unable to write to it.
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.World_AccessDenied.selector, namespace.toString(), address(metadataModule))
    );
    world.installModule(metadataModule, new bytes(0));

    // Transferring the namespace to the module and installing should be a no-op/idempotent and the module will return namespace ownership.
    // TODO: is this a security concern? could someone frontrun by putting a tx in between the two calls below?
    world.transferOwnership(namespace, address(metadataModule));
    world.installModule(metadataModule, new bytes(0));
    assertEq(NamespaceOwner.get(namespace), address(this));
  }

  function testSetResourceMetadata() public {
    world.installModule(metadataModule, new bytes(0));
    ResourceId resource = ResourceMetadata._tableId;

    assertEq(ResourceMetadata.get(resource, "label"), "");

    startGasReport("set resource metadata");
    world.metadata__setResource(resource, "label", "ResourceMetadata");
    endGasReport();

    assertEq(ResourceMetadata.get(resource, "label"), "ResourceMetadata");

    // metadata is mutable
    world.metadata__setResource(resource, "label", "Resource");
    assertEq(ResourceMetadata.get(resource, "label"), "Resource");
  }

  function testSetNonexistentResourceMetadata() public {
    world.installModule(metadataModule, new bytes(0));
    ResourceId resource = WorldResourceIdLib.encode("tb", "whatever", "SomeTable");

    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.World_ResourceNotFound.selector, resource, resource.toString())
    );
    world.metadata__setResource(resource, "label", "SomeTable");
  }

  function testSetUnownedResourceMetadata(address caller) public {
    vm.assume(caller != address(0));
    vm.assume(caller != address(this));

    world.installModule(metadataModule, new bytes(0));
    ResourceId resource = NamespaceOwner._tableId;

    vm.prank(caller);
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.World_AccessDenied.selector, resource.toString(), caller));
    world.metadata__setResource(resource, "label", "NamespaceOwner");
  }
}
