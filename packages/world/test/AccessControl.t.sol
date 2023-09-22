// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreMock } from "@latticexyz/store/test/StoreMock.sol";

import { IWorldErrors } from "../src/interfaces/IWorldErrors.sol";
import { World } from "../src/World.sol";
import { AccessControl } from "../src/AccessControl.sol";
import { ResourceId, WorldResourceIdLib, WorldResourceIdInstance } from "../src/WorldResourceId.sol";
import { RESOURCE_TABLE } from "../src/worldResourceTypes.sol";

import { ResourceAccess } from "../src/tables/ResourceAccess.sol";
import { NamespaceOwner } from "../src/tables/NamespaceOwner.sol";

contract AccessControlTest is Test, GasReporter, StoreMock {
  using WorldResourceIdInstance for ResourceId;

  bytes14 private constant namespace = "namespace";
  bytes16 private constant name = "name";
  address private constant presetCaller = address(0x0123);
  address private constant caller = address(0x01);

  ResourceId private _tableId;
  ResourceId private _namespaceId;

  function setUp() public {
    ResourceAccess.register();
    NamespaceOwner.register();
    _tableId = WorldResourceIdLib.encode({ typeId: RESOURCE_TABLE, namespace: namespace, name: name });
    _namespaceId = WorldResourceIdLib.encodeNamespace(namespace);

    NamespaceOwner.set(namespace, address(this));
    ResourceAccess.set(ResourceId.unwrap(_tableId), presetCaller, true);
  }

  function testAccessControl() public {
    ResourceId tableId = _tableId;
    ResourceId namespaceId = _namespaceId;
    bool hasAccess;

    // Check that the caller has no access to the namespace or name
    startGasReport("AccessControl: hasAccess (cold)");
    hasAccess = AccessControl.hasAccess(tableId, caller);
    endGasReport();
    assertFalse(hasAccess, "caller should not have access to the table");

    // Grant access to the namespace
    ResourceAccess.set(ResourceId.unwrap(namespaceId), caller, true);

    // Check that the caller has access to the namespace or name
    startGasReport("AccessControl: hasAccess (warm, namespace only)");
    hasAccess = AccessControl.hasAccess(tableId, caller);
    endGasReport();
    assertTrue(hasAccess, "caller should have access to the namespace");

    // Revoke access to the namespace
    ResourceAccess.set(ResourceId.unwrap(namespaceId), caller, false);

    // Check that the caller has no access to the namespace or name
    startGasReport("AccessControl: hasAccess (warm)");
    hasAccess = AccessControl.hasAccess(tableId, caller);
    endGasReport();
    assertFalse(hasAccess, "access to the namespace should have been revoked");

    // Grant access to the name
    ResourceAccess.set(ResourceId.unwrap(tableId), caller, true);

    // Check that the caller has access to the name
    assertTrue(AccessControl.hasAccess(tableId, caller), "access to the table should have been granted");

    // Revoke access to the name
    ResourceAccess.set(ResourceId.unwrap(tableId), caller, false);

    // Check that the caller has no access to the namespace or name
    assertFalse(AccessControl.hasAccess(tableId, caller), "access to the table should have been revoked");
  }

  function testRequireAccess() public {
    ResourceId tableId = _tableId;

    startGasReport("AccessControl: requireAccess (cold)");
    AccessControl.requireAccess(tableId, presetCaller);
    endGasReport();

    startGasReport("AccessControl: requireAccess (warm)");
    AccessControl.requireAccess(tableId, presetCaller);
    endGasReport();

    vm.prank(caller);
    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.AccessDenied.selector, tableId.toString(), address(this)));
    startGasReport("AccessControl: requireAccess (this address)");
    AccessControl.requireAccess(tableId, address(this));
    endGasReport();
  }

  function testRequireAccessRevert() public {
    ResourceId tableId = _tableId;

    vm.expectRevert(abi.encodeWithSelector(IWorldErrors.AccessDenied.selector, tableId.toString(), caller));
    AccessControl.requireAccess(tableId, caller);
  }
}
