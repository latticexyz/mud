// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { Store, IStoreHook } from "@latticexyz/store/src/Store.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { System } from "./System.sol";
import { ISystemHook } from "./ISystemHook.sol";
import { ResourceSelector } from "./ResourceSelector.sol";
import { Resource } from "./types.sol";

import { NamespaceOwner } from "./tables/NamespaceOwner.sol";
import { ResourceAccess } from "./tables/ResourceAccess.sol";
import { ResourceType } from "./tables/ResourceType.sol";
import { SystemRegistry } from "./tables/SystemRegistry.sol";
import { Systems } from "./tables/Systems.sol";

bytes16 constant ROOT_NAMESPACE = 0;
bytes16 constant ROOT_FILE = 0;

contract World is Store {
  using ResourceSelector for bytes32;

  error ResourceExists(string resource);
  error AccessDenied(string resource, address caller);
  error InvalidSelector(string resource);
  error SystemExists(address system);

  constructor() {
    // Register internal tables
    NamespaceOwner.registerSchema();
    NamespaceOwner.setMetadata();

    ResourceAccess.registerSchema();
    ResourceAccess.setMetadata();

    ResourceType.registerSchema();
    ResourceType.setMetadata();

    SystemRegistry.registerSchema();
    SystemRegistry.setMetadata();

    Systems.registerSchema();
    Systems.setMetadata();

    // Register the root namespace and give ownership to msg.sender
    ResourceType.set(ROOT_NAMESPACE, Resource.NAMESPACE);
    NamespaceOwner.set(ROOT_NAMESPACE, msg.sender);
    ResourceAccess.set(ROOT_NAMESPACE, msg.sender, true);
  }

  /************************************************************************
   *
   *    REGISTRATION METHODS
   *
   ************************************************************************/

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
    NamespaceOwner.set(namespace, msg.sender);

    // Give caller access to the new namespace
    ResourceAccess.set(resourceSelector, msg.sender, true);
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
    if (file == ROOT_FILE) revert InvalidSelector(resourceSelector.toString());

    // If the namespace doesn't exist yet, register it
    // otherwise require caller to own the namespace
    if (ResourceType.get(namespace) == Resource.NONE) registerNamespace(namespace);
    else _requireOwner(namespace, ROOT_FILE, msg.sender);

    // Require no resource to exist at this selector yet
    if (ResourceType.get(resourceSelector) != Resource.NONE) {
      revert ResourceExists(resourceSelector.toString());
    }

    // Store the table resource type
    ResourceType.set(resourceSelector, Resource.TABLE);

    // Register the table's valueSchema and keySchema
    StoreCore.registerSchema(resourceSelector.toTableId(), valueSchema, keySchema);
  }

  /**
   * Register the given schema for the given table id.
   * This overload exists to conform with the IStore interface.
   */
  function registerSchema(uint256 tableId, Schema valueSchema, Schema keySchema) public virtual override {
    bytes32 tableSelector = ResourceSelector.from(tableId);
    registerTable(tableSelector.getNamespace(), tableSelector.getFile(), valueSchema, keySchema);
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
    bytes32 resourceSelector = _requireOwner(namespace, file, msg.sender);

    // Set the metadata
    StoreCore.setMetadata(resourceSelector.toTableId(), tableName, fieldNames);
  }

  /**
   * Register metadata (tableName, fieldNames) for the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function setMetadata(uint256 tableId, string calldata tableName, string[] calldata fieldNames) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    setMetadata(resourceSelector.getNamespace(), resourceSelector.getFile(), tableName, fieldNames);
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

    revert InvalidSelector(ResourceSelector.from(namespace, file).toString());
  }

  /**
   * Register a hook for the table at the given namepace and file.
   * Requires the caller to own the namespace.
   */
  function registerTableHook(bytes16 namespace, bytes16 file, IStoreHook hook) public virtual {
    // Require caller to own the namespace
    bytes32 resourceSelector = _requireOwner(namespace, file, msg.sender);

    // Register the hook
    StoreCore.registerStoreHook(resourceSelector.toTableId(), hook);
  }

  /**
   * Register a hook for the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   */
  function registerStoreHook(uint256 tableId, IStoreHook hook) public virtual override {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    registerTableHook(resourceSelector.getNamespace(), resourceSelector.getFile(), hook);
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
    if (file == ROOT_FILE) revert InvalidSelector(resourceSelector.toString());

    // Require the system to not exist yet
    if (SystemRegistry.get(address(system)) != 0) revert SystemExists(address(system));

    // If the namespace doesn't exist yet, register it
    // otherwise require caller to own the namespace
    if (ResourceType.get(namespace) == Resource.NONE) registerNamespace(namespace);
    else _requireOwner(namespace, ROOT_FILE, msg.sender);

    // Require no resource to exist at this selector yet
    if (ResourceType.get(resourceSelector) != Resource.NONE) {
      revert ResourceExists(resourceSelector.toString());
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
   * Grant access to the given namespace.
   * Requires the caller to own the namespace.
   */
  function grantAccess(bytes16 namespace, address grantee) public virtual {
    grantAccess(namespace, ROOT_FILE, grantee);
  }

  /**
   * Grant access to the resource at the given namespace and file.
   * Requires the caller to own the namespace.
   */
  function grantAccess(bytes16 namespace, bytes16 file, address grantee) public virtual {
    // Require the caller to own the namespace
    bytes32 resourceSelector = _requireOwner(namespace, file, msg.sender);

    // Grant access to the given resource
    ResourceAccess.set(resourceSelector, grantee, true);
  }

  /**
   * Retract access from the resource at the given namespace and file.
   */
  function retractAccess(bytes16 namespace, bytes16 file, address grantee) public virtual {
    // Require the caller to own the namespace
    bytes32 resourceSelector = _requireOwner(namespace, file, msg.sender);

    // Retract access from the given resource
    ResourceAccess.deleteRecord(resourceSelector, grantee);
  }

  /************************************************************************
   *
   *    STORE METHODS
   *
   ************************************************************************/

  /**
   * Write a record in the table at the given namespace and file.
   * Requires the caller to have access to the namespace or file.
   */
  function setRecord(bytes16 namespace, bytes16 file, bytes32[] calldata key, bytes calldata data) public virtual {
    // Require access to the namespace or file
    bytes32 resourceSelector = _requireAccess(namespace, file, msg.sender);

    // Set the record
    StoreCore.setRecord(resourceSelector.toTableId(), key, data);
  }

  /**
   * Write a record in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function setRecord(uint256 tableId, bytes32[] calldata key, bytes calldata data) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    setRecord(resourceSelector.getNamespace(), resourceSelector.getFile(), key, data);
  }

  /**
   * Write a field in the table at the given namespace and file.
   * Requires the caller to have access to the namespace or file.
   */
  function setField(
    bytes16 namespace,
    bytes16 file,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data
  ) public virtual {
    // Require access to namespace or file
    bytes32 resourceSelector = _requireAccess(namespace, file, msg.sender);

    // Set the field
    StoreCore.setField(resourceSelector.toTableId(), key, schemaIndex, data);
  }

  /**
   * Write a field in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function setField(
    uint256 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data
  ) public virtual override {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    setField(resourceSelector.getNamespace(), resourceSelector.getFile(), key, schemaIndex, data);
  }

  /**
   * Push data to the end of a field in the table at the given namespace and file.
   * Requires the caller to have access to the namespace or file.
   */
  function pushToField(
    bytes16 namespace,
    bytes16 file,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush
  ) public {
    // Require access to namespace or file
    bytes32 resourceSelector = _requireAccess(namespace, file, msg.sender);

    // Push to the field
    StoreCore.pushToField(resourceSelector.toTableId(), key, schemaIndex, dataToPush);
  }

  /**
   * Push data to the end of a field in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function pushToField(
    uint256 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush
  ) public override {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    pushToField(resourceSelector.getNamespace(), resourceSelector.getFile(), key, schemaIndex, dataToPush);
  }

  /**
   * Delete a record in the table at the given namespace and file.
   * Requires the caller to have access to the namespace or file.
   */
  function deleteRecord(bytes16 namespace, bytes16 file, bytes32[] calldata key) public virtual {
    // Require access to namespace or file
    bytes32 resourceSelector = _requireAccess(namespace, file, msg.sender);

    // Delete the record
    StoreCore.deleteRecord(resourceSelector.toTableId(), key);
  }

  /**
   * Delete a record in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function deleteRecord(uint256 tableId, bytes32[] calldata key) public virtual override {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    deleteRecord(resourceSelector.getNamespace(), resourceSelector.getFile(), key);
  }

  /************************************************************************
   *
   *    SYSTEM CALLS
   *
   ************************************************************************/

  /**
   * Call the system at the given namespace and file.
   * If the system is not public, the caller must have access to the namespace or file.
   */
  function call(
    bytes16 namespace,
    bytes16 file,
    bytes calldata funcSelectorAndArgs
  ) public virtual returns (bytes memory) {
    // Load the system data
    (address systemAddress, bool publicAccess) = Systems.get(ResourceSelector.from(namespace, file));

    // Allow access if the system is public or the caller has access to the namespace or file
    if (!publicAccess) _requireAccess(namespace, file, msg.sender);

    // Call the system and forward any return data
    return
      _call({
        msgSender: msg.sender,
        systemAddress: systemAddress,
        funcSelectorAndArgs: funcSelectorAndArgs,
        delegate: namespace == ROOT_NAMESPACE // Use delegatecall for root systems (= registered in the root namespace)
      });
  }

  /**
   * Internal function to call system with delegatecall/call, without access control
   */
  function _call(
    address msgSender,
    address systemAddress,
    bytes calldata funcSelectorAndArgs,
    bool delegate
  ) internal returns (bytes memory) {
    // Append msg.sender to the calldata
    bytes memory callData = abi.encodePacked(funcSelectorAndArgs, msgSender);

    // Call the system using `delegatecall` for root systems and `call` for others
    (bool success, bytes memory data) = delegate
      ? systemAddress.delegatecall(callData) // root system
      : systemAddress.call(callData); // non-root system

    // Forward returned data if the call succeeded
    if (success) return data;

    // Forward error if the call failed
    assembly {
      // data+32 is a pointer to the error message, mload(data) is the length of the error message
      revert(add(data, 0x20), mload(data))
    }
  }

  /**
   * Returns true if the caller has access to the namespace or file, false otherwise.
   */
  function _hasAccess(bytes16 namespace, bytes16 file, address caller) internal view returns (bool) {
    return
      ResourceAccess.get(ResourceSelector.from(namespace, 0), caller) || // First check access based on the namespace
      ResourceAccess.get(ResourceSelector.from(namespace, file), caller); // If caller has no namespace access, check access on the file
  }

  /**
   * Check for access at the given namespace or file.
   * Returns the resourceSelector if the caller has access.
   * Reverts with AccessDenied if the caller has no access.
   */
  function _requireAccess(
    bytes16 namespace,
    bytes16 file,
    address caller
  ) internal view returns (bytes32 resourceSelector) {
    resourceSelector = ResourceSelector.from(namespace, file);

    // Check if the given caller has access to the given namespace or file
    if (!_hasAccess(namespace, file, msg.sender)) {
      revert AccessDenied(resourceSelector.toString(), caller);
    }
  }

  function _requireOwner(
    bytes16 namespace,
    bytes16 file,
    address caller
  ) internal view returns (bytes32 resourceSelector) {
    resourceSelector = ResourceSelector.from(namespace, file);

    if (NamespaceOwner.get(namespace) != msg.sender) {
      revert AccessDenied(resourceSelector.toString(), caller);
    }
  }
}
