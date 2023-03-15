// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreView } from "@latticexyz/store/src/StoreView.sol";

import { World } from "../src/World.sol";
import { AccessControl } from "../src/AccessControl.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";

import { ResourceAccess } from "../src/tables/ResourceAccess.sol";
import { NamespaceOwner } from "../src/tables/NamespaceOwner.sol";

contract AccessControlTest is Test, StoreView {
  bytes16 namespace = "namespace";
  bytes16 file = "file";
  address caller = address(0x01);

  function setUp() public {
    ResourceAccess.registerSchema();
    NamespaceOwner.registerSchema();

    NamespaceOwner.set(namespace, address(this));
    ResourceAccess.set(ResourceSelector.from(namespace, 0), address(this), true);
  }

  function testAccessControl() public {
    // Check that the caller has no access to the namespace or file
    assertFalse(AccessControl.hasAccess(namespace, file, caller));

    // Grant access to the namespace
    ResourceAccess.set(ResourceSelector.from(namespace, 0), caller, true);

    // Check that the caller has access to the namespace or file
    assertTrue(AccessControl.hasAccess(namespace, file, caller));

    // Revoke access to the namespace
    ResourceAccess.set(ResourceSelector.from(namespace, 0), caller, false);

    // Check that the caller has no access to the namespace or file
    assertFalse(AccessControl.hasAccess(namespace, file, caller));

    // Grant access to the file
    ResourceAccess.set(ResourceSelector.from(namespace, file), caller, true);

    // Check that the caller has access to the file
    assertTrue(AccessControl.hasAccess(namespace, file, caller));

    // Revoke access to the file
    ResourceAccess.set(ResourceSelector.from(namespace, file), caller, false);

    // Check that the caller has no access to the namespace or file
    assertFalse(AccessControl.hasAccess(namespace, file, caller));
  }
}
