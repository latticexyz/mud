// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { createWorld } from "@latticexyz/world/test/createWorld.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { IModuleErrors } from "@latticexyz/world/src/IModuleErrors.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { UNLIMITED_DELEGATION } from "@latticexyz/world/src/constants.sol";

import { MetadataModule } from "../src/MetadataModule.sol";
import { IWorld } from "../src/codegen/world/IWorld.sol";
import { ResourceTag } from "../src/codegen/tables/ResourceTag.sol";

contract MetadataModuleTest is Test, GasReporter {
  using WorldResourceIdInstance for ResourceId;

  IWorld world;
  MetadataModule metadataModule = new MetadataModule();
  ResourceId namespace = ResourceTag._tableId.getNamespaceId();

  address alice = vm.addr(uint256(keccak256("alice")));

  function setUp() public {
    world = IWorld(address(createWorld()));
    StoreSwitch.setStoreAddress(address(world));
  }

  function testInstall() public {
    world.registerDelegation(address(metadataModule), UNLIMITED_DELEGATION, new bytes(0));

    startGasReport("install metadata module");
    world.installModule(metadataModule, new bytes(0));
    endGasReport();

    assertEq(NamespaceOwner.get(namespace), address(this));
  }

  function testInstallExistingNamespace() public {
    world.registerNamespace(namespace);

    // Reverts if namespace is registered but not owned by caller.
    vm.prank(alice);
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.World_AccessDenied.selector, namespace.toString(), alice));
    world.installModule(metadataModule, new bytes(0));

    // Reverts without a delegation.
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.World_DelegationNotFound.selector, address(this), address(metadataModule))
    );
    world.installModule(metadataModule, new bytes(0));

    // Succeeds with delegation and passes namespace check.
    world.registerDelegation(address(metadataModule), UNLIMITED_DELEGATION, new bytes(0));
    world.installModule(metadataModule, new bytes(0));
  }

  function testSetResourceTag() public {
    world.registerDelegation(address(metadataModule), UNLIMITED_DELEGATION, new bytes(0));

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
    world.registerDelegation(address(metadataModule), UNLIMITED_DELEGATION, new bytes(0));

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
    world.registerDelegation(address(metadataModule), UNLIMITED_DELEGATION, new bytes(0));

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
    world.registerDelegation(address(metadataModule), UNLIMITED_DELEGATION, new bytes(0));

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
