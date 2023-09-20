// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Hook, HookLib } from "@latticexyz/store/src/Hook.sol";
import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

import { System } from "../../../System.sol";
import { WorldContextConsumer, WORLD_CONTEXT_CONSUMER_INTERFACE_ID } from "../../../WorldContext.sol";
import { WorldResourceIdLib, WorldResourceIdInstance } from "../../../WorldResourceId.sol";
import { SystemCall } from "../../../SystemCall.sol";
import { ROOT_NAMESPACE_ID, ROOT_NAME, UNLIMITED_DELEGATION } from "../../../constants.sol";
import { RESOURCE_NAMESPACE, RESOURCE_SYSTEM } from "../../../worldResourceTypes.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { requireInterface } from "../../../requireInterface.sol";
import { NamespaceOwner } from "../../../tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../../tables/ResourceAccess.sol";
import { Delegations } from "../../../tables/Delegations.sol";
import { ISystemHook, SYSTEM_HOOK_INTERFACE_ID } from "../../../interfaces/ISystemHook.sol";
import { IWorldErrors } from "../../../interfaces/IWorldErrors.sol";
import { IDelegationControl, DELEGATION_CONTROL_INTERFACE_ID } from "../../../interfaces/IDelegationControl.sol";

import { SystemHooks, SystemHooksTableId } from "../tables/SystemHooks.sol";
import { SystemRegistry } from "../tables/SystemRegistry.sol";
import { Systems } from "../tables/Systems.sol";
import { FunctionSelectors } from "../tables/FunctionSelectors.sol";

/**
 * Functions related to registering resources other than tables in the World.
 * Registering tables is implemented in StoreRegistrationSystem.sol
 */
contract WorldRegistrationSystem is System, IWorldErrors {
  using ResourceIdInstance for ResourceId;
  using WorldResourceIdInstance for ResourceId;

  /**
   * Register a new namespace
   */
  function registerNamespace(ResourceId namespaceId) public virtual {
    // Require the provided namespace ID to have type RESOURCE_NAMESPACE
    if (namespaceId.getType() != RESOURCE_NAMESPACE) {
      revert InvalidResourceType(string(bytes.concat(namespaceId.getType())));
    }

    // Require namespace to not exist yet
    if (ResourceIds._getExists(ResourceId.unwrap(namespaceId))) {
      revert ResourceExists(namespaceId, namespaceId.toString());
    }

    // Register namespace resource ID
    ResourceIds._setExists(ResourceId.unwrap(namespaceId), true);

    // Register caller as the namespace owner
    NamespaceOwner._set(ResourceId.unwrap(namespaceId), _msgSender());

    // Give caller access to the new namespace
    ResourceAccess._set(ResourceId.unwrap(namespaceId), _msgSender(), true);
  }

  /**
   * Register a hook for the system at the given system ID
   */
  function registerSystemHook(ResourceId systemId, ISystemHook hookAddress, uint8 enabledHooksBitmap) public virtual {
    // Require the provided address to implement the ISystemHook interface
    requireInterface(address(hookAddress), SYSTEM_HOOK_INTERFACE_ID);

    // Require caller to own the namespace
    AccessControl.requireOwner(systemId, _msgSender());

    // Register the hook
    SystemHooks.push(
      ResourceId.unwrap(systemId),
      Hook.unwrap(HookLib.encode(address(hookAddress), enabledHooksBitmap))
    );
  }

  /**
   * Unregister the given hook for the system at the given system ID
   */
  function unregisterSystemHook(ResourceId systemId, ISystemHook hookAddress) public virtual {
    // Require caller to own the namespace
    AccessControl.requireOwner(systemId, _msgSender());

    // Remove the hook from the list of hooks for this system in the system hooks table
    HookLib.filterListByAddress(SystemHooksTableId, systemId, address(hookAddress));
  }

  /**
   * Register the given system in the given namespace.
   * If the namespace doesn't exist yet, it is registered.
   * The system is granted access to its namespace, so it can write to any table in the same namespace.
   * If publicAccess is true, no access control check is performed for calling the system.
   *
   * Note: this function doesn't check whether a system already exists at the given selector,
   * making it possible to upgrade systems.
   */
  function registerSystem(ResourceId systemId, WorldContextConsumer system, bool publicAccess) public virtual {
    // Require the provided system ID to have type RESOURCE_SYSTEM
    if (systemId.getType() != RESOURCE_SYSTEM) {
      revert InvalidResourceType(string(bytes.concat(systemId.getType())));
    }

    // Require the provided address to implement the WorldContextConsumer interface
    requireInterface(address(system), WORLD_CONTEXT_CONSUMER_INTERFACE_ID);

    // Require the name to not be the namespace's root name
    if (systemId.getName() == ROOT_NAME) revert InvalidResourceId(systemId, systemId.toString());

    // Require this system to not be registered at a different system ID yet
    bytes32 existingSystemId = SystemRegistry._get(address(system));
    if (existingSystemId != 0 && existingSystemId != ResourceId.unwrap(systemId)) {
      revert SystemExists(address(system));
    }

    // If the namespace doesn't exist yet, register it
    ResourceId namespaceId = systemId.getNamespaceId();
    if (!ResourceIds._getExists(ResourceId.unwrap(namespaceId))) {
      registerNamespace(namespaceId);
    } else {
      // otherwise require caller to own the namespace
      AccessControl.requireOwner(namespaceId, _msgSender());
    }

    // Check if a system already exists at this system ID
    address existingSystem = Systems._getSystem(ResourceId.unwrap(systemId));

    // If there is an existing system with this system ID, remove it
    if (existingSystem != address(0)) {
      // Remove the existing system from the system registry
      SystemRegistry._deleteRecord(existingSystem);

      // Remove the existing system's access to its namespace
      ResourceAccess._deleteRecord(ResourceId.unwrap(namespaceId), existingSystem);
    } else {
      // Otherwise, this is a new system, so register its resource ID
      ResourceIds._setExists(ResourceId.unwrap(systemId), true);
    }

    // Systems = mapping from system ID to system address and public access flag
    Systems._set(ResourceId.unwrap(systemId), address(system), publicAccess);

    // SystemRegistry = mapping from system address to system ID
    SystemRegistry._set(address(system), ResourceId.unwrap(systemId));

    // Grant the system access to its namespace
    ResourceAccess._set(ResourceId.unwrap(namespaceId), address(system), true);
  }

  /**
   * Register a World function selector for the given namespace, name and system function.
   * TODO: instead of mapping to a resource, the function selector could map direcly to a system function,
   * which would save one sload per call, but add some complexity to upgrading systems. TBD.
   * (see https://github.com/latticexyz/mud/issues/444)
   * TODO: replace separate systemFunctionName and systemFunctionArguments with a signature argument
   */
  function registerFunctionSelector(
    ResourceId systemId,
    string memory systemFunctionName,
    string memory systemFunctionArguments
  ) public returns (bytes4 worldFunctionSelector) {
    // Require the caller to own the namespace
    AccessControl.requireOwner(systemId, _msgSender());

    // Compute global function selector
    string memory namespaceString = WorldResourceIdLib.toTrimmedString(systemId.getNamespace());
    string memory nameString = WorldResourceIdLib.toTrimmedString(systemId.getName());
    worldFunctionSelector = bytes4(
      keccak256(abi.encodePacked(namespaceString, "_", nameString, "_", systemFunctionName, systemFunctionArguments))
    );

    // Require the function selector to be globally unique
    bytes32 existingSystemId = FunctionSelectors._getSystemId(worldFunctionSelector);

    if (existingSystemId != 0) revert FunctionSelectorExists(worldFunctionSelector);

    // Register the function selector
    bytes memory systemFunctionSignature = abi.encodePacked(systemFunctionName, systemFunctionArguments);
    bytes4 systemFunctionSelector = systemFunctionSignature.length == 0
      ? bytes4(0) // Save gas by storing 0x0 for empty function signatures (= fallback function)
      : bytes4(keccak256(systemFunctionSignature));
    FunctionSelectors._set(worldFunctionSelector, ResourceId.unwrap(systemId), systemFunctionSelector);
  }

  /**
   * Register a root World function selector (without namespace / name prefix).
   * Requires the caller to own the root namespace.
   * TODO: instead of mapping to a resource, the function selector could map direcly to a system function,
   * which would save one sload per call, but add some complexity to upgrading systems. TBD.
   * (see https://github.com/latticexyz/mud/issues/444)
   */
  function registerRootFunctionSelector(
    ResourceId systemId,
    bytes4 worldFunctionSelector,
    bytes4 systemFunctionSelector
  ) public returns (bytes4) {
    // Require the caller to own the root namespace
    AccessControl.requireOwner(ROOT_NAMESPACE_ID, _msgSender());

    // Require the function selector to be globally unique
    bytes32 existingSystemId = FunctionSelectors._getSystemId(worldFunctionSelector);

    if (existingSystemId != 0) revert FunctionSelectorExists(worldFunctionSelector);

    // Register the function selector
    FunctionSelectors._set(worldFunctionSelector, ResourceId.unwrap(systemId), systemFunctionSelector);

    return worldFunctionSelector;
  }

  /**
   * Register a delegation from the caller to the given delegatee.
   */
  function registerDelegation(address delegatee, ResourceId delegationControlId, bytes memory initCallData) public {
    // Store the delegation control contract address
    Delegations.set({
      delegator: _msgSender(),
      delegatee: delegatee,
      delegationControlId: ResourceId.unwrap(delegationControlId)
    });

    // If the delegation is not unlimited...
    if (ResourceId.unwrap(delegationControlId) != ResourceId.unwrap(UNLIMITED_DELEGATION) && initCallData.length > 0) {
      // Require the delegationControl contract to implement the IDelegationControl interface
      (address delegationControl, ) = Systems._get(ResourceId.unwrap(delegationControlId));
      requireInterface(delegationControl, DELEGATION_CONTROL_INTERFACE_ID);

      // Call the delegation control contract's init function
      SystemCall.call({ caller: _msgSender(), systemId: delegationControlId, callData: initCallData, value: 0 });
    }
  }
}
