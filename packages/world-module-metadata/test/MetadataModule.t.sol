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
import { ResourceTag } from "../src/codegen/tables/ResourceTag.sol";

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

    ResourceId namespace = ResourceTag._tableId.getNamespaceId();
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

  function testSetResourceTag() public {
    world.installModule(metadataModule, new bytes(0));
    ResourceId resource = ResourceTag._tableId;

    assertEq(world.metadata__getResourceTag(resource, "label"), "");
    assertEq(ResourceTag.get(resource, "label"), "");

    startGasReport("set resource tag");
    world.metadata__setResourceTag(resource, "label", "ResourceTag");
    endGasReport();

    assertEq(world.metadata__getResourceTag(resource, "label"), "ResourceTag");
    assertEq(ResourceTag.get(resource, "label"), "ResourceTag");

    // metadata is mutable, so make sure we can mutate it
    world.metadata__setResourceTag(resource, "label", "Resource");
    assertEq(world.metadata__getResourceTag(resource, "label"), "Resource");
    assertEq(ResourceTag.get(resource, "label"), "Resource");
  }

  function testDeleteResourceTag() public {
    world.installModule(metadataModule, new bytes(0));
    ResourceId resource = ResourceTag._tableId;

    world.metadata__setResourceTag(resource, "label", "ResourceTag");
    assertEq(ResourceTag.get(resource, "label"), "ResourceTag");
    assertEq(world.metadata__getResourceTag(resource, "label"), "ResourceTag");

    startGasReport("delete resource tag");
    world.metadata__deleteResourceTag(resource, "label");
    endGasReport();

    assertEq(world.metadata__getResourceTag(resource, "label"), "");
    assertEq(ResourceTag.get(resource, "label"), "");
  }

  function testTagNonexistentResource() public {
    world.installModule(metadataModule, new bytes(0));
    ResourceId resource = WorldResourceIdLib.encode("tb", "whatever", "SomeTable");

    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.World_ResourceNotFound.selector, resource, resource.toString())
    );
    world.metadata__setResourceTag(resource, "label", "SomeTable");

    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.World_ResourceNotFound.selector, resource, resource.toString())
    );
    world.metadata__deleteResourceTag(resource, "label");
  }

  function testTagUnownedResource(address caller) public {
    vm.assume(caller != address(0));
    vm.assume(caller != address(this));

    world.installModule(metadataModule, new bytes(0));
    ResourceId resource = NamespaceOwner._tableId;

    vm.startPrank(caller);

    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.World_AccessDenied.selector, resource.toString(), caller));
    world.metadata__setResourceTag(resource, "label", "NamespaceOwner");

    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.World_AccessDenied.selector, resource.toString(), caller));
    world.metadata__deleteResourceTag(resource, "label");
  }
}
