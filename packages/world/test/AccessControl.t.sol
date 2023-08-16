// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreReadWithStubs } from "@latticexyz/store/src/StoreReadWithStubs.sol";

import { World } from "../src/World.sol";
import { AccessControl } from "../src/AccessControl.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";

import { ResourceAccess } from "../src/tables/ResourceAccess.sol";
import { NamespaceOwner } from "../src/tables/NamespaceOwner.sol";

contract AccessControlTest is Test, StoreReadWithStubs {
  bytes16 namespace = "namespace";
  bytes16 name = "name";
  address caller = address(0x01);

  function setUp() public {
    ResourceAccess.register();
    NamespaceOwner.register();

    NamespaceOwner.set(namespace, address(this));
    ResourceAccess.set(ResourceSelector.from(namespace, 0), address(this), true);
  }

  function testAccessControl() public {
    // Check that the caller has no access to the namespace or name
    assertFalse(AccessControl.hasAccess(namespace, name, caller));

    // Grant access to the namespace
    ResourceAccess.set(ResourceSelector.from(namespace, 0), caller, true);

    // Check that the caller has access to the namespace or name
    assertTrue(AccessControl.hasAccess(namespace, name, caller));

    // Revoke access to the namespace
    ResourceAccess.set(ResourceSelector.from(namespace, 0), caller, false);

    // Check that the caller has no access to the namespace or name
    assertFalse(AccessControl.hasAccess(namespace, name, caller));

    // Grant access to the name
    ResourceAccess.set(ResourceSelector.from(namespace, name), caller, true);

    // Check that the caller has access to the name
    assertTrue(AccessControl.hasAccess(namespace, name, caller));

    // Revoke access to the name
    ResourceAccess.set(ResourceSelector.from(namespace, name), caller, false);

    // Check that the caller has no access to the namespace or name
    assertFalse(AccessControl.hasAccess(namespace, name, caller));
  }
}
