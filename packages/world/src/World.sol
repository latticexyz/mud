// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Store, IStoreHook } from "@latticexyz/store/src/Store.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";

import { System } from "./System.sol";
import { ResourceSelector } from "./ResourceSelector.sol";
import { Resource } from "./types.sol";
import { ROOT_NAMESPACE, ROOT_FILE } from "./constants.sol";
import { Errors } from "./Errors.sol";
import { AccessControl } from "./AccessControl.sol";

import { NamespaceOwner } from "./tables/NamespaceOwner.sol";
import { ResourceAccess } from "./tables/ResourceAccess.sol";
import { ResourceType } from "./tables/ResourceType.sol";
import { SystemRegistry } from "./tables/SystemRegistry.sol";
import { Systems } from "./tables/Systems.sol";
import { FunctionSelectors } from "./tables/FunctionSelectors.sol";

import { RegistrationSystem } from "./systems/RegistrationSystem.sol";

import { IWorldCore } from "./interfaces/IWorldCore.sol";
import { IWorld } from "./interfaces/IWorld.sol";

contract World is Store, IWorldCore {
  using ResourceSelector for bytes32;

  // IWorld includes interfaces for dynamically registered systems (e.g. IRegistrationSystem)
  IWorld private immutable _this = IWorld(address(this));

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

    FunctionSelectors.registerSchema();
    FunctionSelectors.setMetadata();

    // Register the root namespace and give ownership to msg.sender
    ResourceType.set(ROOT_NAMESPACE, Resource.NAMESPACE);
    NamespaceOwner.set(ROOT_NAMESPACE, msg.sender);
    ResourceAccess.set(ROOT_NAMESPACE, msg.sender, true);
  }

  /**
   * Register internal function selectors
   */
  function initialize() public {
    // Require the caller to be the root namespace owner
    AccessControl.requireOwner(ROOT_NAMESPACE, ROOT_FILE, msg.sender);

    bytes16 registrationSystemFile = "registration";

    // Register RegistrationSystem
    RegistrationSystem registrationSystem = new RegistrationSystem();
    _call({
      msgSender: msg.sender,
      systemAddress: address(registrationSystem),
      funcSelectorAndArgs: abi.encodeWithSelector(
        RegistrationSystem.registerSystem.selector,
        ROOT_NAMESPACE,
        registrationSystemFile,
        address(registrationSystem),
        true
      ),
      delegate: true
    });

    // Register root function selectors for internal systems
    bytes4[9] memory rootFunctionSelectors = [
      registrationSystem.registerNamespace.selector,
      registrationSystem.registerTable.selector,
      registrationSystem.setMetadata.selector,
      registrationSystem.registerHook.selector,
      registrationSystem.registerTableHook.selector,
      registrationSystem.registerSystemHook.selector,
      registrationSystem.registerSystem.selector,
      registrationSystem.registerFunctionSelector.selector,
      registrationSystem.registerRootFunctionSelector.selector
    ];

    for (uint256 i = 0; i < rootFunctionSelectors.length; i++) {
      _call({
        msgSender: msg.sender,
        systemAddress: address(registrationSystem),
        funcSelectorAndArgs: abi.encodeWithSelector(
          RegistrationSystem.registerRootFunctionSelector.selector,
          ROOT_NAMESPACE,
          registrationSystemFile,
          rootFunctionSelectors[i], // Use the same function selector for the World as in RegistrationSystem
          rootFunctionSelectors[i]
        ),
        delegate: true
      });
    }
  }

  /************************************************************************
   *
   *    WORLD METHODS
   *
   ************************************************************************/

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
    bytes32 resourceSelector = AccessControl.requireOwner(namespace, file, msg.sender);

    // Grant access to the given resource
    ResourceAccess.set(resourceSelector, grantee, true);
  }

  /**
   * Retract access from the resource at the given namespace and file.
   */
  function retractAccess(bytes16 namespace, bytes16 file, address grantee) public virtual {
    // Require the caller to own the namespace
    bytes32 resourceSelector = AccessControl.requireOwner(namespace, file, msg.sender);

    // Retract access from the given resource
    ResourceAccess.deleteRecord(resourceSelector, grantee);
  }

  /************************************************************************
   *
   *    WORLD STORE METHODS
   *
   ************************************************************************/

  /**
   * Write a record in the table at the given namespace and file.
   * Requires the caller to have access to the namespace or file.
   */
  function setRecord(bytes16 namespace, bytes16 file, bytes32[] calldata key, bytes calldata data) public virtual {
    // Require access to the namespace or file
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, file, msg.sender);

    // Set the record
    StoreCore.setRecord(resourceSelector.toTableId(), key, data);
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
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, file, msg.sender);

    // Set the field
    StoreCore.setField(resourceSelector.toTableId(), key, schemaIndex, data);
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
  ) public virtual {
    // Require access to namespace or file
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, file, msg.sender);

    // Push to the field
    StoreCore.pushToField(resourceSelector.toTableId(), key, schemaIndex, dataToPush);
  }

  /**
   * Delete a record in the table at the given namespace and file.
   * Requires the caller to have access to the namespace or file.
   */
  function deleteRecord(bytes16 namespace, bytes16 file, bytes32[] calldata key) public virtual {
    // Require access to namespace or file
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, file, msg.sender);

    // Delete the record
    StoreCore.deleteRecord(resourceSelector.toTableId(), key);
  }

  /************************************************************************
   *
   *    STORE OVERRIDE METHODS
   *
   ************************************************************************/

  /**
   * Register the given schema for the given table id.
   * This overload exists to conform with the IStore interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function registerSchema(uint256 tableId, Schema valueSchema, Schema keySchema) public virtual {
    bytes32 tableSelector = ResourceSelector.from(tableId);
    _this.registerTable(tableSelector.getNamespace(), tableSelector.getFile(), valueSchema, keySchema);
  }

  /**
   * Register metadata (tableName, fieldNames) for the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function setMetadata(uint256 tableId, string calldata tableName, string[] calldata fieldNames) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    _this.setMetadata(resourceSelector.getNamespace(), resourceSelector.getFile(), tableName, fieldNames);
  }

  /**
   * Register a hook for the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   */
  function registerStoreHook(uint256 tableId, IStoreHook hook) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    _this.registerTableHook(resourceSelector.getNamespace(), resourceSelector.getFile(), hook);
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
    bytes memory funcSelectorAndArgs
  ) public virtual returns (bytes memory) {
    // Load the system data
    bytes32 resourceSelector = ResourceSelector.from(namespace, file);
    (address systemAddress, bool publicAccess) = Systems.get(resourceSelector);

    // Check if the system exists
    if (systemAddress == address(0)) revert Errors.ResourceNotFound(resourceSelector.toString());

    // Allow access if the system is public or the caller has access to the namespace or file
    if (!publicAccess) AccessControl.requireAccess(namespace, file, msg.sender);

    // Call the system and forward any return data
    return
      _call({
        msgSender: msg.sender,
        systemAddress: systemAddress,
        funcSelectorAndArgs: funcSelectorAndArgs,
        delegate: namespace == ROOT_NAMESPACE // Use delegatecall for root systems (= registered in the root namespace)
      });
  }

  /************************************************************************
   *
   *    DYNAMIC FUNCTION SELECTORS
   *
   ************************************************************************/

  /**
   * Fallback function to call registered function selectors
   */
  fallback() external {
    (bytes16 namespace, bytes16 file, bytes4 systemFunctionSelector) = FunctionSelectors.get(msg.sig);

    if (namespace == 0 && file == 0) revert Errors.FunctionSelectorNotFound(msg.sig);

    // Replace function selector in the calldata with the system function selector
    bytes memory callData = Bytes.setBytes4(msg.data, 0, systemFunctionSelector);

    bytes memory returnData = call(namespace, file, callData);
    assembly {
      return(add(returnData, 0x20), mload(returnData))
    }
  }

  /************************************************************************
   *
   *    INTERNAL FUNCTIONS
   *
   ************************************************************************/

  /**
   * Internal function to call system with delegatecall/call, without access control
   */
  function _call(
    address msgSender,
    address systemAddress,
    bytes memory funcSelectorAndArgs,
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
}
