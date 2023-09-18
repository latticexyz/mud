// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreMock } from "@latticexyz/store/test/StoreMock.sol";

import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";
import { World } from "../src/World.sol";
import { AccessControl } from "../src/AccessControl.sol";
import { ResourceSelector } from "../src/ResourceSelector.sol";

import { ResourceAccess, NamespaceOwner } from "../src/codegen/index.sol";

contract AccessControlTest is Test, GasReporter, StoreMock {
  bytes16 constant namespace = "namespace";
  bytes16 constant name = "name";
  address constant presetCaller = address(0x0123);
  address constant caller = address(0x01);

  function setUp() public {
    ResourceAccess.register();
    NamespaceOwner.register();

    NamespaceOwner.set(namespace, address(this));
    ResourceAccess.set(ResourceSelector.from(namespace, name), presetCaller, true);
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
    startGasReport("AccessControl: hasAccess (warm, namespace only)");
    hasAccess = AccessControl.hasAccess(ResourceSelector.from(namespace, name), caller);
    endGasReport();
    assertTrue(hasAccess);

    // Revoke access to the namespace
    ResourceAccess.set(ResourceSelector.from(namespace, 0), caller, false);

    // Check that the caller has no access to the namespace or name
    startGasReport("AccessControl: hasAccess (warm)");
    hasAccess = AccessControl.hasAccess(ResourceSelector.from(namespace, name), caller);
    endGasReport();
    assertFalse(hasAccess);

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
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);
    startGasReport("AccessControl: requireAccess (cold)");
    AccessControl.requireAccess(resourceSelector, presetCaller);
    endGasReport();

    startGasReport("AccessControl: requireAccess (warm)");
    AccessControl.requireAccess(resourceSelector, presetCaller);
    endGasReport();

    startGasReport("AccessControl: requireAccess (this address)");
    AccessControl.requireAccess(resourceSelector, address(this));
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
