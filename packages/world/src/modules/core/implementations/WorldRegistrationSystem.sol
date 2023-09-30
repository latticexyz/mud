// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Hook, HookLib } from "@latticexyz/store/src/Hook.sol";
import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

import { System } from "../../../System.sol";
import { WorldContextConsumer, WORLD_CONTEXT_CONSUMER_INTERFACE_ID } from "../../../WorldContext.sol";
import { WorldResourceIdLib, WorldResourceIdInstance } from "../../../WorldResourceId.sol";
import { SystemCall } from "../../../SystemCall.sol";
import { ROOT_NAMESPACE_ID, ROOT_NAME } from "../../../constants.sol";
import { RESOURCE_NAMESPACE, RESOURCE_SYSTEM } from "../../../worldResourceTypes.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { Delegation } from "../../../Delegation.sol";
import { requireInterface } from "../../../requireInterface.sol";
import { NamespaceOwner } from "../../../codegen/tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../../codegen/tables/ResourceAccess.sol";
import { UserDelegationControl } from "../../../codegen/tables/UserDelegationControl.sol";
import { NamespaceDelegationControl } from "../../../codegen/tables/NamespaceDelegationControl.sol";
import { ISystemHook, SYSTEM_HOOK_INTERFACE_ID } from "../../../ISystemHook.sol";
import { IWorldErrors } from "../../../IWorldErrors.sol";
import { IDelegationControl, DELEGATION_CONTROL_INTERFACE_ID } from "../../../IDelegationControl.sol";

import { SystemHooks, SystemHooksTableId } from "../../../codegen/tables/SystemHooks.sol";
import { SystemRegistry } from "../../../codegen/tables/SystemRegistry.sol";
import { Systems } from "../../../codegen/tables/Systems.sol";
import { FunctionSelectors } from "../../../codegen/tables/FunctionSelectors.sol";
import { FunctionSignatures } from "../../../codegen/tables/FunctionSignatures.sol";

/**
 * @title WorldRegistrationSystem
 * @dev This contract provides functions related to registering resources other than tables in the World.
 */
contract WorldRegistrationSystem is System, IWorldErrors {
  using ResourceIdInstance for ResourceId;
  using WorldResourceIdInstance for ResourceId;

  /**
   * @notice Registers a new namespace
   * @dev Creates a new namespace resource with the given ID
   * @param namespaceId The unique identifier for the new namespace
   */
  function registerNamespace(ResourceId namespaceId) public virtual {
    // Require the provided namespace ID to have type RESOURCE_NAMESPACE
    if (namespaceId.getType() != RESOURCE_NAMESPACE) {
      revert World_InvalidResourceType(RESOURCE_NAMESPACE, namespaceId, namespaceId.toString());
    }

    // Require namespace to not exist yet
    if (ResourceIds._getExists(namespaceId)) {
      revert World_ResourceAlreadyExists(namespaceId, namespaceId.toString());
    }

    // Register namespace resource ID
    ResourceIds._setExists(namespaceId, true);

    // Register caller as the namespace owner
    NamespaceOwner._set(namespaceId, _msgSender());

    // Give caller access to the new namespace
    ResourceAccess._set(namespaceId, _msgSender(), true);
  }

  /**
   * @notice Registers a new system hook
   * @dev Adds a new hook for the system at the provided system ID
   * @param systemId The ID of the system
   * @param hookAddress The address of the hook being registered
   * @param enabledHooksBitmap Bitmap indicating which hooks are enabled
   */
  function registerSystemHook(ResourceId systemId, ISystemHook hookAddress, uint8 enabledHooksBitmap) public virtual {
    // Require the provided address to implement the ISystemHook interface
    requireInterface(address(hookAddress), SYSTEM_HOOK_INTERFACE_ID);

    // Require caller to own the namespace
    AccessControl.requireOwner(systemId, _msgSender());

    // Register the hook
    SystemHooks.push(systemId, Hook.unwrap(HookLib.encode(address(hookAddress), enabledHooksBitmap)));
  }

  /**
   * @notice Unregisters a system hook
   * @dev Removes a hook for the system at the provided system ID
   * @param systemId The ID of the system
   * @param hookAddress The address of the hook being unregistered
   */
  function unregisterSystemHook(ResourceId systemId, ISystemHook hookAddress) public virtual {
    // Require caller to own the namespace
    AccessControl.requireOwner(systemId, _msgSender());

    // Remove the hook from the list of hooks for this system in the system hooks table
    HookLib.filterListByAddress(SystemHooksTableId, systemId, address(hookAddress));
  }

  /**
   * @notice Registers a system
   * @dev Registers or upgrades a system at the given ID
   * If the namespace doesn't exist yet, it is registered.
   * The system is granted access to its namespace, so it can write to any
   * table in the same namespace.
   * If publicAccess is true, no access control check is performed for calling the system.
   * This function doesn't check whether a system already exists at the given selector,
   * making it possible to upgrade systems.
   * @param systemId The unique identifier for the system
   * @param system The system being registered
   * @param publicAccess Flag indicating if access control check is bypassed
   */
  function registerSystem(ResourceId systemId, WorldContextConsumer system, bool publicAccess) public virtual {
    // Require the provided system ID to have type RESOURCE_SYSTEM
    if (systemId.getType() != RESOURCE_SYSTEM) {
      revert World_InvalidResourceType(RESOURCE_SYSTEM, systemId, systemId.toString());
    }

    // Require the provided address to implement the WorldContextConsumer interface
    requireInterface(address(system), WORLD_CONTEXT_CONSUMER_INTERFACE_ID);

    // Require the name to not be the namespace's root name
    if (systemId.getName() == ROOT_NAME) revert World_InvalidResourceId(systemId, systemId.toString());

    // Require this system to not be registered at a different system ID yet
    ResourceId existingSystemId = SystemRegistry._get(address(system));
    if (
      ResourceId.unwrap(existingSystemId) != 0 && ResourceId.unwrap(existingSystemId) != ResourceId.unwrap(systemId)
    ) {
      revert World_SystemAlreadyExists(address(system));
    }

    // If the namespace doesn't exist yet, register it
    ResourceId namespaceId = systemId.getNamespaceId();
    if (!ResourceIds._getExists(namespaceId)) {
      registerNamespace(namespaceId);
    } else {
      // otherwise require caller to own the namespace
      AccessControl.requireOwner(namespaceId, _msgSender());
    }

    // Check if a system already exists at this system ID
    address existingSystem = Systems._getSystem(systemId);

    // If there is an existing system with this system ID, remove it
    if (existingSystem != address(0)) {
      // Remove the existing system from the system registry
      SystemRegistry._deleteRecord(existingSystem);

      // Remove the existing system's access to its namespace
      ResourceAccess._deleteRecord(namespaceId, existingSystem);
    } else {
      // Otherwise, this is a new system, so register its resource ID
      ResourceIds._setExists(systemId, true);
    }

    // Systems = mapping from system ID to system address and public access flag
    Systems._set(systemId, address(system), publicAccess);

    // SystemRegistry = mapping from system address to system ID
    SystemRegistry._set(address(system), systemId);

    // Grant the system access to its namespace
    ResourceAccess._set(namespaceId, address(system), true);
  }

  /**
   * @notice Registers a new World function selector
   * @dev Creates a mapping between a World function and its associated system function
   * @param systemId The system ID
   * @param systemFunctionSignature The signature of the system function
   * @return worldFunctionSelector The selector of the World function
   */
  function registerFunctionSelector(
    ResourceId systemId,
    string memory systemFunctionSignature
  ) public returns (bytes4 worldFunctionSelector) {
    // Require the caller to own the namespace
    AccessControl.requireOwner(systemId, _msgSender());

    // Compute global function selector
    string memory namespaceString = WorldResourceIdLib.toTrimmedString(systemId.getNamespace());
    string memory nameString = WorldResourceIdLib.toTrimmedString(systemId.getName());
    bytes memory worldFunctionSignature = abi.encodePacked(
      namespaceString,
      "_",
      nameString,
      "_",
      systemFunctionSignature
    );
    worldFunctionSelector = bytes4(keccak256(worldFunctionSignature));

    // Require the function selector to be globally unique
    ResourceId existingSystemId = FunctionSelectors._getSystemId(worldFunctionSelector);

    if (ResourceId.unwrap(existingSystemId) != 0) revert World_FunctionSelectorAlreadyExists(worldFunctionSelector);

    // Register the function selector
    bytes4 systemFunctionSelector = bytes4(keccak256(bytes(systemFunctionSignature)));
    FunctionSelectors._set(worldFunctionSelector, systemId, systemFunctionSelector);

    // Register the function signature for offchain use
    FunctionSignatures._set(worldFunctionSelector, string(worldFunctionSignature));
  }

  /**
   * @notice Registers a root World function selector
   * @dev Creates a mapping for a root World function without namespace or name prefix
   * @param systemId The system ID
   * @param worldFunctionSignature The signature of the World function
   * @param systemFunctionSelector The selector of the system function
   * @return worldFunctionSelector The selector of the World function
   */
  function registerRootFunctionSelector(
    ResourceId systemId,
    string memory worldFunctionSignature,
    bytes4 systemFunctionSelector
  ) public returns (bytes4 worldFunctionSelector) {
    // Require the caller to own the root namespace
    AccessControl.requireOwner(ROOT_NAMESPACE_ID, _msgSender());

    // Compute the function selector from the provided signature
    worldFunctionSelector = bytes4(keccak256(bytes(worldFunctionSignature)));

    // Require the function selector to be globally unique
    ResourceId existingSystemId = FunctionSelectors._getSystemId(worldFunctionSelector);

    if (ResourceId.unwrap(existingSystemId) != 0) revert World_FunctionSelectorAlreadyExists(worldFunctionSelector);

    // Register the function selector
    FunctionSelectors._set(worldFunctionSelector, systemId, systemFunctionSelector);

    // Register the function signature for offchain use
    FunctionSignatures._set(worldFunctionSelector, worldFunctionSignature);
  }

  /**
   * @notice Registers a delegation for the caller
   * @dev Creates a new delegation from the caller to the specified delegatee
   * @param delegatee The address of the delegatee
   * @param delegationControlId The ID controlling the delegation
   * @param initCallData The initialization data for the delegation
   */
  function registerDelegation(address delegatee, ResourceId delegationControlId, bytes memory initCallData) public {
    // Store the delegation control contract address
    UserDelegationControl._set({
      delegator: _msgSender(),
      delegatee: delegatee,
      delegationControlId: delegationControlId
    });

    // If the delegation is limited...
    if (Delegation.isLimited(delegationControlId) && initCallData.length > 0) {
      // Require the delegationControl contract to implement the IDelegationControl interface
      (address delegationControl, ) = Systems._get(delegationControlId);
      requireInterface(delegationControl, DELEGATION_CONTROL_INTERFACE_ID);

      // Call the delegation control contract's init function
      SystemCall.callWithHooksOrRevert({
        caller: _msgSender(),
        systemId: delegationControlId,
        callData: initCallData,
        value: 0
      });
    }
  }

  /**
   * @notice Registers a delegation for a namespace
   * @dev Sets up a new delegation control for a specific namespace
   * @param namespaceId The ID of the namespace
   * @param delegationControlId The ID controlling the delegation
   * @param initCallData The initialization data for the delegation
   */
  function registerNamespaceDelegation(
    ResourceId namespaceId,
    ResourceId delegationControlId,
    bytes memory initCallData
  ) public {
    // Require the namespaceId to be a valid namespace ID
    if (namespaceId.getType() != RESOURCE_NAMESPACE) {
      revert World_InvalidResourceType(RESOURCE_NAMESPACE, namespaceId, namespaceId.toString());
    }

    // Require the delegation to not be unlimited
    if (!Delegation.isLimited(delegationControlId)) {
      revert World_UnlimitedDelegationNotAllowed();
    }

    // Require the caller to own the namespace
    AccessControl.requireOwner(namespaceId, _msgSender());

    // Require the delegationControl contract to implement the IDelegationControl interface
    (address delegationControl, ) = Systems._get(delegationControlId);
    requireInterface(delegationControl, DELEGATION_CONTROL_INTERFACE_ID);

    // Register the delegation control
    NamespaceDelegationControl._set(namespaceId, delegationControlId);

    // Call the delegation control contract's init function
    if (initCallData.length > 0) {
      SystemCall.callWithHooksOrRevert({
        caller: _msgSender(),
        systemId: delegationControlId,
        callData: initCallData,
        value: 0
      });
    }
  }
}
