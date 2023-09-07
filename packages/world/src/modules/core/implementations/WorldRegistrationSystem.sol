// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Hook } from "@latticexyz/store/src/Hook.sol";

import { System } from "../../../System.sol";
import { WorldContextConsumer } from "../../../WorldContext.sol";
import { ResourceSelector } from "../../../ResourceSelector.sol";
import { Resource } from "../../../Types.sol";
import { SystemCall } from "../../../SystemCall.sol";
import { SystemHookLib } from "../../../SystemHook.sol";
import { ROOT_NAMESPACE, ROOT_NAME, UNLIMITED_DELEGATION } from "../../../constants.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { NamespaceOwner } from "../../../tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../../tables/ResourceAccess.sol";
import { Delegations } from "../../../tables/Delegations.sol";
import { ISystemHook } from "../../../interfaces/ISystemHook.sol";
import { IWorldErrors } from "../../../interfaces/IWorldErrors.sol";

import { ResourceType } from "../tables/ResourceType.sol";
import { SystemHooks } from "../tables/SystemHooks.sol";
import { SystemRegistry } from "../tables/SystemRegistry.sol";
import { Systems } from "../tables/Systems.sol";
import { FunctionSelectors } from "../tables/FunctionSelectors.sol";

/**
 * Functions related to registering resources other than tables in the World.
 * Registering tables is implemented in StoreRegistrationSystem.sol
 */
contract WorldRegistrationSystem is System, IWorldErrors {
  using ResourceSelector for bytes32;

  /**
   * Register a new namespace
   */
  function registerNamespace(bytes16 namespace) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(namespace);

    // Require namespace to not exist yet
    if (ResourceType.get(namespace) != Resource.NONE) revert ResourceExists(resourceSelector.toString());

    // Register namespace resource
    ResourceType.set(namespace, Resource.NAMESPACE);

    // Register caller as the namespace owner
    NamespaceOwner.set(namespace, _msgSender());

    // Give caller access to the new namespace
    ResourceAccess.set(resourceSelector, _msgSender(), true);
  }

  /**
   * Register a hook for the system at the given namespace and name
   */
  function registerSystemHook(
    bytes32 resourceSelector,
    ISystemHook hookAddress,
    uint8 enabledHooksBitmap
  ) public virtual {
    // Require caller to own the namespace
    AccessControl.requireOwnerOrSelf(resourceSelector, _msgSender());

    // Register the hook
    SystemHooks.push(resourceSelector, Hook.unwrap(SystemHookLib.encode(hookAddress, enabledHooksBitmap)));
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
  function registerSystem(bytes32 resourceSelector, WorldContextConsumer system, bool publicAccess) public virtual {
    // Require the name to not be the namespace's root name
    if (resourceSelector.getName() == ROOT_NAME) revert InvalidSelector(resourceSelector.toString());

    // Require this system to not be registered at a different resource selector yet
    bytes32 existingResourceSelector = SystemRegistry.get(address(system));
    if (existingResourceSelector != 0 && existingResourceSelector != resourceSelector) {
      revert SystemExists(address(system));
    }

    // If the namespace doesn't exist yet, register it
    // otherwise require caller to own the namespace
    bytes16 namespace = resourceSelector.getNamespace();
    if (ResourceType.get(namespace) == Resource.NONE) registerNamespace(namespace);
    else AccessControl.requireOwnerOrSelf(namespace, _msgSender());

    // Require no resource other than a system to exist at this selector yet
    Resource resourceType = ResourceType.get(resourceSelector);
    if (resourceType != Resource.NONE && resourceType != Resource.SYSTEM) {
      revert ResourceExists(resourceSelector.toString());
    }

    // Check if a system already exists at this resource selector
    address existingSystem = Systems.getSystem(resourceSelector);

    // If there is an existing system with this resource selector, remove it
    if (existingSystem != address(0)) {
      // Remove the existing system from the system registry
      SystemRegistry.deleteRecord(existingSystem);

      // Remove the existing system's access to its namespace
      ResourceAccess.deleteRecord(namespace, existingSystem);
    } else {
      // Otherwise, this is a new system, so register its resource type
      ResourceType.set(resourceSelector, Resource.SYSTEM);
    }

    // Systems = mapping from resourceSelector to system address and publicAccess
    Systems.set(resourceSelector, address(system), publicAccess);

    // SystemRegistry = mapping from system address to resourceSelector
    SystemRegistry.set(address(system), resourceSelector);

    // Grant the system access to its namespace
    ResourceAccess.set(namespace, address(system), true);
  }

  /**
   * Register a World function selector for the given namespace, name and system function.
   * TODO: instead of mapping to a resource, the function selector could map direcly to a system function,
   * which would save one sload per call, but add some complexity to upgrading systems. TBD.
   * (see https://github.com/latticexyz/mud/issues/444)
   */
  function registerFunctionSelector(
    bytes32 resourceSelector,
    string memory systemFunctionName,
    string memory systemFunctionArguments
  ) public returns (bytes4 worldFunctionSelector) {
    // Require the caller to own the namespace
    AccessControl.requireOwnerOrSelf(resourceSelector, _msgSender());

    // Compute global function selector
    string memory namespaceString = ResourceSelector.toTrimmedString(resourceSelector.getNamespace());
    string memory nameString = ResourceSelector.toTrimmedString(resourceSelector.getName());
    worldFunctionSelector = bytes4(
      keccak256(abi.encodePacked(namespaceString, "_", nameString, "_", systemFunctionName, systemFunctionArguments))
    );

    // Require the function selector to be globally unique
    bytes32 existingResourceSelector = FunctionSelectors.getResourceSelector(worldFunctionSelector);

    if (existingResourceSelector != 0) revert FunctionSelectorExists(worldFunctionSelector);

    // Register the function selector
    bytes memory systemFunctionSignature = abi.encodePacked(systemFunctionName, systemFunctionArguments);
    bytes4 systemFunctionSelector = systemFunctionSignature.length == 0
      ? bytes4(0) // Save gas by storing 0x0 for empty function signatures (= fallback function)
      : bytes4(keccak256(systemFunctionSignature));
    FunctionSelectors.set(worldFunctionSelector, resourceSelector, systemFunctionSelector);
  }

  /**
   * Register a root World function selector (without namespace / name prefix).
   * Requires the caller to own the root namespace.
   * TODO: instead of mapping to a resource, the function selector could map direcly to a system function,
   * which would save one sload per call, but add some complexity to upgrading systems. TBD.
   * (see https://github.com/latticexyz/mud/issues/444)
   */
  function registerRootFunctionSelector(
    bytes32 resourceSelector,
    bytes4 worldFunctionSelector,
    bytes4 systemFunctionSelector
  ) public returns (bytes4) {
    // Require the caller to own the root namespace
    AccessControl.requireOwnerOrSelf(ROOT_NAMESPACE, _msgSender());

    // Require the function selector to be globally unique
    bytes32 existingResourceSelector = FunctionSelectors.getResourceSelector(worldFunctionSelector);

    if (existingResourceSelector != 0) revert FunctionSelectorExists(worldFunctionSelector);

    // Register the function selector
    FunctionSelectors.set(worldFunctionSelector, resourceSelector, systemFunctionSelector);

    return worldFunctionSelector;
  }

  /**
   * Register a delegation from the caller to the given delegatee.
   */
  function registerDelegation(
    address delegatee,
    bytes32 delegationControlId,
    bytes memory initFuncSelectorAndArgs
  ) public {
    // Store the delegation control contract address
    Delegations.set({ delegator: _msgSender(), delegatee: delegatee, delegationControlId: delegationControlId });

    // If the delegation is not unlimited, call the delegation control contract's init function
    if (delegationControlId != UNLIMITED_DELEGATION && initFuncSelectorAndArgs.length > 0) {
      SystemCall.call({
        caller: _msgSender(),
        resourceSelector: delegationControlId,
        funcSelectorAndArgs: initFuncSelectorAndArgs,
        value: 0
      });
    }
  }
}
