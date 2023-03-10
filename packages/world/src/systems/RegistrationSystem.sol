// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Store, IStoreHook } from "@latticexyz/store/src/Store.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { System } from "../System.sol";
import { ResourceSelector } from "../ResourceSelector.sol";
import { Resource } from "../types.sol";
import { ROOT_NAMESPACE, ROOT_FILE } from "../constants.sol";
import { Errors } from "../Errors.sol";
import { AccessControl } from "../AccessControl.sol";

import { NamespaceOwner } from "../tables/NamespaceOwner.sol";
import { ResourceAccess } from "../tables/ResourceAccess.sol";
import { ResourceType } from "../tables/ResourceType.sol";
import { SystemRegistry } from "../tables/SystemRegistry.sol";
import { Systems } from "../tables/Systems.sol";
import { FunctionSelectors } from "../tables/FunctionSelectors.sol";

import { ISystemHook } from "../interfaces/ISystemHook.sol";
import { IRegistrationSystem } from "../interfaces/systems/IRegistrationSystem.sol";

contract RegistrationSystem is System, IRegistrationSystem {
  using ResourceSelector for bytes32;

  /**
   * Register a new namespace
   */
  function registerNamespace(bytes16 namespace) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(namespace);

    // Require namespace to not exist yet
    if (ResourceType.get(namespace) != Resource.NONE) revert Errors.ResourceExists(resourceSelector.toString());

    // Register namespace resource
    ResourceType.set(namespace, Resource.NAMESPACE);

    // Register caller as the namespace owner
    NamespaceOwner.set(namespace, _msgSender());

    // Give caller access to the new namespace
    ResourceAccess.set(resourceSelector, _msgSender(), true);
  }

  /**
   * Register a table with given schema in the given namespace
   */
  function registerTable(
    bytes16 namespace,
    bytes16 file,
    Schema valueSchema,
    Schema keySchema
  ) public virtual returns (bytes32 resourceSelector) {
    resourceSelector = ResourceSelector.from(namespace, file);

    // Require the file selector to not be the namespace's root file
    if (file == ROOT_FILE) revert Errors.InvalidSelector(resourceSelector.toString());

    // If the namespace doesn't exist yet, register it
    // otherwise require caller to own the namespace
    if (ResourceType.get(namespace) == Resource.NONE) registerNamespace(namespace);
    else AccessControl.requireOwner(namespace, ROOT_FILE, _msgSender());

    // Require no resource to exist at this selector yet
    if (ResourceType.get(resourceSelector) != Resource.NONE) {
      revert Errors.ResourceExists(resourceSelector.toString());
    }

    // Store the table resource type
    ResourceType.set(resourceSelector, Resource.TABLE);

    // Register the table's schema
    StoreCore.registerSchema(resourceSelector.toTableId(), valueSchema, keySchema);
  }

  /**
   * Register metadata (tableName, fieldNames) for the table at the given namespace and file.
   * Requires the caller to own the namespace.
   */
  function setMetadata(
    bytes16 namespace,
    bytes16 file,
    string calldata tableName,
    string[] calldata fieldNames
  ) public virtual {
    // Require caller to own the namespace
    bytes32 resourceSelector = AccessControl.requireOwner(namespace, file, _msgSender());

    // Set the metadata
    StoreCore.setMetadata(resourceSelector.toTableId(), tableName, fieldNames);
  }

  /**
   * Register the given store hook for the table at the given namespace and file.
   * Hooks on table files must implement the IStoreHook interface,
   * and hooks on system files must implement the ISystemHook interface.
   */
  function registerHook(bytes16 namespace, bytes16 file, address hook) public virtual {
    Resource resourceType = ResourceType.get(ResourceSelector.from(namespace, file));

    if (resourceType == Resource.TABLE) {
      return registerTableHook(namespace, file, IStoreHook(hook));
    }

    if (resourceType == Resource.SYSTEM) {
      return registerSystemHook(namespace, file, ISystemHook(hook));
    }

    revert Errors.InvalidSelector(ResourceSelector.from(namespace, file).toString());
  }

  /**
   * Register a hook for the table at the given namepace and file.
   * Requires the caller to own the namespace.
   */
  function registerTableHook(bytes16 namespace, bytes16 file, IStoreHook hook) public virtual {
    // Require caller to own the namespace
    bytes32 resourceSelector = AccessControl.requireOwner(namespace, file, _msgSender());

    // Register the hook
    StoreCore.registerStoreHook(resourceSelector.toTableId(), hook);
  }

  /**
   * Register a hook for the system at the given namespace and file
   */
  function registerSystemHook(bytes16 namespace, bytes16 file, ISystemHook hook) public virtual {
    // TODO implement (see https://github.com/latticexyz/mud/issues/444)
  }

  /**
   * Register the given system in the given namespace.
   * If the namespace doesn't exist yet, it is registered.
   * The system is granted access to its namespace, so it can write to any table in the same namespace.
   * If publicAccess is true, no access control check is performed for calling the system.
   */
  function registerSystem(
    bytes16 namespace,
    bytes16 file,
    System system,
    bool publicAccess
  ) public virtual returns (bytes32 resourceSelector) {
    resourceSelector = ResourceSelector.from(namespace, file);

    // Require the file selector to not be the namespace's root file
    if (file == ROOT_FILE) revert Errors.InvalidSelector(resourceSelector.toString());

    // Require the system to not exist yet
    if (SystemRegistry.get(address(system)) != 0) revert Errors.SystemExists(address(system));

    // If the namespace doesn't exist yet, register it
    // otherwise require caller to own the namespace
    if (ResourceType.get(namespace) == Resource.NONE) registerNamespace(namespace);
    else AccessControl.requireOwner(namespace, ROOT_FILE, _msgSender());

    // Require no resource to exist at this selector yet
    if (ResourceType.get(resourceSelector) != Resource.NONE) {
      revert Errors.ResourceExists(resourceSelector.toString());
    }

    // Store the system resource type
    ResourceType.set(resourceSelector, Resource.SYSTEM);

    // Systems = mapping from resourceSelector to system address and publicAccess
    Systems.set(resourceSelector, address(system), publicAccess);

    // SystemRegistry = mapping from system address to resourceSelector
    SystemRegistry.set(address(system), resourceSelector);

    // Grant the system access to its namespace
    ResourceAccess.set(namespace, address(system), true);
  }

  /**
   * Register a World function selector for the given namespace, file and system function.
   * TODO: instead of mapping to a resource, the function selector could map direcly to a system function,
   * which would save one sload per call, but add some complexity to upgrading systems. TBD.
   * (see https://github.com/latticexyz/mud/issues/444)
   */
  function registerFunctionSelector(
    bytes16 namespace,
    bytes16 file,
    string memory systemFunctionName,
    string memory systemFunctionArguments
  ) public returns (bytes4 worldFunctionSelector) {
    // Require the caller to own the namespace
    AccessControl.requireOwner(namespace, file, _msgSender());

    // Compute global function selector
    string memory namespaceString = ResourceSelector.toTrimmedString(namespace);
    string memory fileString = ResourceSelector.toTrimmedString(file);
    worldFunctionSelector = bytes4(
      keccak256(abi.encodePacked(namespaceString, "_", fileString, "_", systemFunctionName, systemFunctionArguments))
    );

    // Require the function selector to be globally unique
    bytes16 existingNamespace = FunctionSelectors.getNamespace(worldFunctionSelector);
    bytes16 existingFile = FunctionSelectors.getFile(worldFunctionSelector);

    if (existingNamespace != 0 || existingFile != 0) revert Errors.FunctionSelectorExists(worldFunctionSelector);

    // Register the function selector
    bytes memory systemFunctionSignature = abi.encodePacked(systemFunctionName, systemFunctionArguments);
    bytes4 systemFunctionSelector = systemFunctionSignature.length == 0
      ? bytes4(0) // Save gas by storing 0x0 for empty function signatures (= fallback function)
      : bytes4(keccak256(systemFunctionSignature));
    FunctionSelectors.set(worldFunctionSelector, namespace, file, systemFunctionSelector);
  }

  /**
   * Register a root World function selector (without namespace / file prefix).
   * Requires the caller to own the root namespace.
   * TODO: instead of mapping to a resource, the function selector could map direcly to a system function,
   * which would save one sload per call, but add some complexity to upgrading systems. TBD.
   * (see https://github.com/latticexyz/mud/issues/444)
   */
  function registerRootFunctionSelector(
    bytes16 namespace,
    bytes16 file,
    bytes4 worldFunctionSelector,
    bytes4 systemFunctionSelector
  ) public returns (bytes4) {
    // Require the caller to own the root namespace
    AccessControl.requireOwner(ROOT_NAMESPACE, ROOT_FILE, _msgSender());

    // Require the function selector to be globally unique
    bytes16 existingNamespace = FunctionSelectors.getNamespace(worldFunctionSelector);
    bytes16 existingFile = FunctionSelectors.getFile(worldFunctionSelector);

    if (!(existingNamespace == 0 && existingFile == 0)) revert Errors.FunctionSelectorExists(worldFunctionSelector);

    // Register the function selector
    FunctionSelectors.set(worldFunctionSelector, namespace, file, systemFunctionSelector);

    return worldFunctionSelector;
  }
}
