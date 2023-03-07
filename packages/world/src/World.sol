// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { Store, IStoreHook } from "@latticexyz/store/src/Store.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { System } from "./System.sol";
import { ISystemHook } from "./ISystemHook.sol";
import { ResourceSelector } from "./ResourceSelector.sol";

import { NamespaceOwner } from "./tables/NamespaceOwner.sol";
import { ResourceAccess } from "./tables/ResourceAccess.sol";
import { SystemRegistry } from "./tables/SystemRegistry.sol";
import { Systems } from "./tables/Systems.sol";

bytes16 constant ROOT_NAMESPACE = 0;
bytes16 constant ROOT_FILE = 0;

contract World is Store {
  error NamespaceExists(string namespace);
  error AccessDenied(string namespace, address caller);
  error InvalidSelector(bytes32 selector);
  error SystemExists(address system);

  constructor() {
    NamespaceOwner.registerSchema();
    ResourceAccess.registerSchema();
    SystemRegistry.registerSchema();
    Systems.registerSchema();

    // Register the root namespace and give ownership to msg.sender
    NamespaceOwner.set({ namespace: ROOT_NAMESPACE, owner: msg.sender });
    ResourceAccess.set({ selector: ROOT_NAMESPACE, caller: msg.sender, access: true });
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
    // Require namespace to not exist yet
    // TODO: This does not allow burning access to namespaces because someone else could re-register the namespace,
    // so we need to add another table (Eg a ResourceTable)
    if (NamespaceOwner.get(namespace) != address(0)) revert NamespaceExists(ResourceSelector.toString(namespace));

    // Register caller as the namespace owner
    NamespaceOwner.set({ namespace: namespace, owner: msg.sender });

    // Give caller access to the new namespace
    ResourceAccess.set({ selector: ResourceSelector.from(namespace, ROOT_FILE), caller: msg.sender, access: true });
  }

  /**
   * Register register a table with given schema in the given namespace
   */
  function registerTable(
    bytes16 namespace,
    bytes16 file,
    Schema schema
  ) public virtual returns (bytes32 resourceSelector) {
    // Require the file selector to not be the root file
    if (file == ROOT_FILE) revert InvalidSelector(file);

    // Register namespace if it doesn't exist yet, otherwise require caller to own the namespace
    _registerNamespaceOrRequireOwner(namespace);

    resourceSelector = ResourceSelector.from(namespace, file);

    // StoreCore handles checking for existence of this table
    StoreCore.registerSchema(uint256(resourceSelector), schema);
  }

  /**
   * Register a store hook for table at a given namespace and file.
   * Hooks on table files must implement the IStoreHook interface,
   * and hooks on system files must implement the ISystemHook interface.
   */
  function registerHook(bytes16 namespace, bytes16 file, address hook) public virtual {
    // TODO: Check which file type is at this selector and call the appropriate register hook method
    // For now we just assume it's a table file
    registerTableHook(namespace, file, IStoreHook(hook));
  }

  /**
   * Register a hook for the table at the given namepace and file.
   * Requires the caller to own the namespace.
   */
  function registerTableHook(bytes16 namespace, bytes16 file, IStoreHook hook) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(namespace, file);

    // Require caller to own the namespace of the given tableId
    if (NamespaceOwner.get(namespace) != msg.sender)
      revert AccessDenied(ResourceSelector.toString(resourceSelector), msg.sender);

    // Register the hook
    StoreCore.registerStoreHook(uint256(resourceSelector), hook);
  }

  /**
   * Register a hook for the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   */
  function registerStoreHook(uint256 tableId, IStoreHook hook) public virtual override {
    bytes32 resourceSelector = bytes32(tableId);
    registerTableHook(
      ResourceSelector.getNamespace(resourceSelector),
      ResourceSelector.getFile(resourceSelector),
      hook
    );
  }

  /**
   * Register a hook for the system at the given namespace and file
   */
  function registerSystemHook(bytes16 namespace, bytes16 file, ISystemHook hook) public virtual {
    // TODO implement (see https://github.com/latticexyz/mud/issues/444)
  }

  /**
   * Register a system in the given namespace.
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
    // Require the file selector to not be the root file
    if (file == ROOT_FILE) revert InvalidSelector(file);

    // Require the system to not exist yet
    if (SystemRegistry.get(address(system)) != 0) revert SystemExists(address(system));

    // Register namespace if it doesn't exist yet, otherwise require caller to own the namespace
    _registerNamespaceOrRequireOwner(namespace);

    resourceSelector = ResourceSelector.from(namespace, file);

    // Systems = mapping from resourceSelector to system address and publicAccess
    Systems.set(resourceSelector, address(system), publicAccess);

    // SystemRegistry = mapping from system address to resourceSelector
    SystemRegistry.set(address(system), resourceSelector);

    // Grant the system access to its namespace
    ResourceAccess.set({ selector: namespace, caller: address(system), access: true });
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
    bytes32 resourceSelector = ResourceSelector.from(namespace, file);

    // Require the caller to own the namespace
    if (NamespaceOwner.get(namespace) != msg.sender)
      revert AccessDenied(ResourceSelector.toString(resourceSelector), msg.sender);

    // Grant access to the given resource
    ResourceAccess.set({ selector: resourceSelector, caller: grantee, access: true });
  }

  /**
   * Retract access from the resource at the given namespace and file.
   */
  function retractAccess(bytes16 namespace, bytes16 file, address grantee) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(namespace, file);

    // Require the caller to own the namespace
    if (NamespaceOwner.get(namespace) != msg.sender)
      revert AccessDenied(ResourceSelector.toString(resourceSelector), msg.sender);

    // Retract access from the given resource
    ResourceAccess.deleteRecord({ selector: resourceSelector, caller: grantee });
  }

  /************************************************************************
   *
   *    STORE METHODS
   *
   ************************************************************************/

  /**
   * Write a record in a table at a given namespace and file.
   * Requires the caller to have access to the namespace or file.
   */
  function setRecord(bytes16 namespace, bytes16 file, bytes32[] calldata key, bytes calldata data) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(namespace, file);

    // Require access to the namespace or file
    if (!_hasAccess(namespace, file, msg.sender))
      revert AccessDenied(ResourceSelector.toString(resourceSelector), msg.sender);

    // Set the record
    StoreCore.setRecord(uint256(resourceSelector), key, data);
  }

  /**
   * Write a record in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function setRecord(uint256 tableId, bytes32[] calldata key, bytes calldata data) public virtual {
    bytes32 resourceSelector = bytes32(tableId);
    setRecord(ResourceSelector.getNamespace(resourceSelector), ResourceSelector.getFile(resourceSelector), key, data);
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
    bytes32 resourceSelector = ResourceSelector.from(namespace, file);

    // Require access to namespace or file
    if (!_hasAccess(namespace, file, msg.sender))
      revert AccessDenied(ResourceSelector.toString(resourceSelector), msg.sender);

    // Set the field
    StoreCore.setField(uint256(resourceSelector), key, schemaIndex, data);
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
    bytes32 resourceSelector = bytes32(tableId);
    setField(
      ResourceSelector.getNamespace(resourceSelector),
      ResourceSelector.getFile(resourceSelector),
      key,
      schemaIndex,
      data
    );
  }

  /**
   * Delete a record in the table at the given namespace and file.
   * Requires the caller to have access to the namespace or file.
   */
  function deleteRecord(bytes16 namespace, bytes16 file, bytes32[] calldata key) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(namespace, file);

    // Require access to namespace or file
    if (!_hasAccess(namespace, file, msg.sender))
      revert AccessDenied(ResourceSelector.toString(resourceSelector), msg.sender);

    // Delete the record
    StoreCore.deleteRecord(uint256(resourceSelector), key);
  }

  /**
   * Delete a record in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function deleteRecord(uint256 tableId, bytes32[] calldata key) public virtual override {
    bytes32 resourceSelector = bytes32(tableId);
    deleteRecord(ResourceSelector.getNamespace(resourceSelector), ResourceSelector.getFile(resourceSelector), key);
  }

  /**
   * Register a schema for a given table id.
   * This overload exists to conform with the IStore interface.
   */
  function registerSchema(uint256 tableId, Schema schema) public virtual override {
    bytes32 tableSelector = bytes32(tableId);
    registerTable(ResourceSelector.getNamespace(tableSelector), ResourceSelector.getFile(tableSelector), schema);
  }

  /**
   * Register metadata (tableName, fieldNames) for the table at the given namespace and file.
   * Requires the caller to own the namespace.
   */
  function setMetadata(bytes16 namespace, bytes16 file, string[] calldata fieldNames) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(namespace, file);

    // Require caller to own the namespace
    if (NamespaceOwner.get(namespace) != msg.sender)
      revert AccessDenied(ResourceSelector.toString(resourceSelector), msg.sender);

    setMetadata(uint256(resourceSelector), tableName, fieldNames);
  }

  /**
   * Register metadata (tableName, fieldNames) for the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function setMetadata(uint256 tableId, string calldata tableName, string[] calldata fieldNames) public virtual {
    bytes32 resourceSelector = bytes32(tableId);
    setMetadata(
      ResourceSelector.getNamespace(resourceSelector),
      ResourceSelector.getFile(resourceSelector),
      tableName,
      fieldNames
    );
  }

  /************************************************************************
   *
   *    SYSTEM CALLS
   *
   ************************************************************************/

  /**
   * Call a system at a given namespace and file.
   * If the system is not public, the caller must have access to the namespace or file.
   */
  function call(
    bytes16 namespace,
    bytes16 file,
    bytes calldata funcSelectorAndArgs
  ) public virtual returns (bytes memory) {
    bytes32 resourceSelector = ResourceSelector.from(namespace, file);

    // Load the system data
    (address systemAddress, bool publicAccess) = Systems.get(resourceSelector);

    // Allow access if the system is public or the caller has access to the namespace or file
    if (!publicAccess && !_hasAccess(namespace, file, msg.sender)) {
      revert AccessDenied(ResourceSelector.toString(resourceSelector), msg.sender);
    }

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
   * Register a namespace if it doesn't exist yet, or require that the caller is the owner of the namespace
   */
  function _registerNamespaceOrRequireOwner(bytes16 namespace) internal {
    address namespaceOwner = NamespaceOwner.get(namespace);
    if (namespaceOwner == address(0)) {
      registerNamespace(namespace);
    } else if (namespaceOwner != msg.sender) {
      revert AccessDenied(ResourceSelector.toString(namespace), msg.sender);
    }
  }

  /**
   * Check if the given caller has access to the given namespace or file
   */
  function _hasAccess(bytes16 namespace, bytes16 file, address caller) internal view returns (bool) {
    return
      ResourceAccess.get(ResourceSelector.from(namespace, 0), caller) || // First check based on namespace
      ResourceAccess.get(ResourceSelector.from(namespace, file), caller); // If caller has no namespace access, check access on the file
  }
}
