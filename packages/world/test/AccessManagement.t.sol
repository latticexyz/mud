// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreReadWithStubs } from "@latticexyz/store/src/StoreReadWithStubs.sol";

import { ResourceSelector } from "../src/ResourceSelector.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";
import { ROOT_NAME } from "../src/constants.sol";

import { ResourceAccess } from "../src/tables/ResourceAccess.sol";
import { NamespaceOwner } from "../src/tables/NamespaceOwner.sol";
import { setupWorld } from "./setupWorld.sol";

contract AccessManagementTest is Test, StoreReadWithStubs {
  using ResourceSelector for bytes32;

  bytes16 namespace = "namespace";
  bytes16 name = "name";
  address owner = address(0x01);
  address caller = address(0x02);
  IBaseWorld world;

  function setUp() public {}

  function testAccessControl() public {
    world = setupWorld();

    // Check that the caller has no access to the namespace or name
    assertFalse(world.hasAccess(namespace, name, caller));

    // Register the namespace
    vm.prank(owner);
    world.registerNamespace(namespace);

    // Check that the namespace is owned by the owner
    assertTrue(world.hasAccess(namespace, name, owner));

    // Check that the caller still has no access to the namespace
    assertFalse(world.hasAccess(namespace, name, caller));

    // Check that the caller can't grant access to the namespace
    vm.prank(caller);
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.AccessDenied.selector,
        ResourceSelector.from(namespace, ROOT_NAME).toString(),
        caller
      )
    );
    world.grantAccess(namespace, ROOT_NAME, caller);

    // Grant access to the namespace
    vm.prank(owner);
    world.grantAccess(namespace, ROOT_NAME, caller);

    // Check that the caller has access to the namespace or name
    assertTrue(world.hasAccess(namespace, name, caller));

    // Revoke access to the namespace
    vm.prank(owner);
    world.revokeAccess(namespace, ROOT_NAME, caller);

    // Check that the caller has no access to the namespace or name
    assertFalse(world.hasAccess(namespace, name, caller));

    // Check that the caller can't grant access to the name
    vm.prank(caller);
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.AccessDenied.selector,
        ResourceSelector.from(namespace, name).toString(),
        caller
      )
    );
    world.grantAccess(namespace, name, caller);

    // Grant access to the name
    vm.prank(owner);
    world.grantAccess(namespace, name, caller);

    // Check that the caller has access to the name
    assertTrue(world.hasAccess(namespace, name, caller));

    // Revoke access to the name
    vm.prank(owner);
    world.revokeAccess(namespace, name, caller);

    // Check that the caller has no access to the namespace or name
    assertFalse(world.hasAccess(namespace, name, caller));
  }
}
