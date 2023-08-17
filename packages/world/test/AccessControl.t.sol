// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreReadWithStubs } from "@latticexyz/store/src/StoreReadWithStubs.sol";

import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";
import { World } from "../src/World.sol";
import { AccessControl } from "../src/AccessControl.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";

import { ResourceAccess } from "../src/tables/ResourceAccess.sol";
import { NamespaceOwner } from "../src/tables/NamespaceOwner.sol";

contract AccessControlTest is Test, GasReporter, StoreReadWithStubs {
  bytes16 namespace = "namespace";
  bytes16 name = "name";
  address caller = address(0x01);

  function setUp() public {
    ResourceAccess.register();
    NamespaceOwner.register();

    NamespaceOwner.set(namespace, address(this));
    ResourceAccess.set(ResourceSelector.from(namespace), address(this), true);
  }

  function testAccessControl() public {
    bool hasAccess;

    // Check that the caller has no access to the namespace or name
    startGasReport("AccessControl: hasAccess (cold)");
    hasAccess = AccessControl.hasAccess(ResourceSelector.from(namespace, name), caller);
    endGasReport();
    assertFalse(hasAccess);

    // Grant access to the namespace
    ResourceAccess.set(ResourceSelector.from(namespace, 0), caller, true);

    // Check that the caller has access to the namespace or name
    startGasReport("AccessControl: hasAccess (warm)");
    hasAccess = AccessControl.hasAccess(ResourceSelector.from(namespace, name), caller);
    endGasReport();
    assertTrue(hasAccess);

    // Revoke access to the namespace
    ResourceAccess.set(ResourceSelector.from(namespace, 0), caller, false);

    // Check that the caller has no access to the namespace or name
    assertFalse(AccessControl.hasAccess(ResourceSelector.from(namespace, name), caller));

    // Grant access to the name
    ResourceAccess.set(ResourceSelector.from(namespace, name), caller, true);

    // Check that the caller has access to the name
    assertTrue(AccessControl.hasAccess(ResourceSelector.from(namespace, name), caller));

    // Revoke access to the name
    ResourceAccess.set(ResourceSelector.from(namespace, name), caller, false);

    // Check that the caller has no access to the namespace or name
    assertFalse(AccessControl.hasAccess(ResourceSelector.from(namespace, name), caller));
  }

  function testRequireAccess() public {
    startGasReport("AccessControl: requireAccess (cold)");
    AccessControl.requireAccess(ResourceSelector.from(namespace), address(this));
    endGasReport();

    startGasReport("AccessControl: requireAccess (warm)");
    AccessControl.requireAccess(ResourceSelector.from(namespace), address(this));
    endGasReport();
  }

  function testRequireAccessRevert() public {
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);
    vm.expectRevert(
      abi.encodeWithSelector(IWorldErrors.AccessDenied.selector, ResourceSelector.toString(resourceSelector), caller)
    );
    AccessControl.requireAccess(resourceSelector, caller);
  }
}
