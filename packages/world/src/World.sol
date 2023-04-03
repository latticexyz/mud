// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Store, IStoreHook } from "@latticexyz/store/src/Store.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";

import { System } from "./System.sol";
import { ResourceSelector } from "./ResourceSelector.sol";
import { Resource } from "./Types.sol";
import { ROOT_NAMESPACE, ROOT_FILE, REGISTRATION_SYSTEM_NAME } from "./constants.sol";
import { AccessControl } from "./AccessControl.sol";
import { Call } from "./Call.sol";

import { NamespaceOwner } from "./tables/NamespaceOwner.sol";
import { ResourceAccess } from "./tables/ResourceAccess.sol";
import { Systems } from "./tables/Systems.sol";
import { FunctionSelectors } from "./tables/FunctionSelectors.sol";
import { InstalledModules } from "./tables/InstalledModules.sol";

import { IModule } from "./interfaces/IModule.sol";
import { IWorldCore } from "./interfaces/IWorldCore.sol";
import { IBaseWorld } from "./interfaces/IBaseWorld.sol";
import { IRegistrationSystem } from "./interfaces/IRegistrationSystem.sol";

contract World is Store, IWorldCore {
  using ResourceSelector for bytes32;

  constructor() {
    // Register internal NamespaceOwner table and give ownership of the root
    // namespace to msg.sender. This is done in the constructor instead of a
    // module, so that we can use it for access control checks in `installRootModule`.
    NamespaceOwner.registerSchema();
    NamespaceOwner.set(ROOT_NAMESPACE, msg.sender);

    // Other internal tables are registered by the CoreModule to reduce World's bytecode size.
  }

  /**
   * Install the given module at the given namespace in the World.
   */
  function installModule(IModule module, bytes memory args) public {
    Call.withSender({
      msgSender: msg.sender,
      target: address(module),
      funcSelectorAndArgs: abi.encodeWithSelector(IModule.install.selector, args),
      delegate: false,
      value: 0
    });

    // Register the module in the InstalledModules table
    InstalledModules.set(module.getName(), keccak256(args), address(module));
  }

  /**
   * Install the given root module in the World.
   * Requires the caller to own the root namespace.
   * The module is delegatecalled and installed in the root namespace.
   */
  function installRootModule(IModule module, bytes memory args) public {
    AccessControl.requireOwner(ROOT_NAMESPACE, ROOT_FILE, msg.sender);

    Call.withSender({
      msgSender: msg.sender,
      target: address(module),
      funcSelectorAndArgs: abi.encodeWithSelector(IModule.install.selector, args),
      delegate: true, // The module is delegate called so it can edit any table
      value: 0
    });

    // Register the module in the InstalledModules table
    InstalledModules.set(module.getName(), keccak256(args), address(module));
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
   * Update data at `startByteIndex` of a field in the table at the given namespace and file.
   * Requires the caller to have access to the namespace or file.
   */
  function updateInField(
    bytes16 namespace,
    bytes16 file,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet
  ) public virtual {
    // Require access to namespace or file
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, file, msg.sender);

    // Update data in the field
    StoreCore.updateInField(resourceSelector.toTableId(), key, schemaIndex, startByteIndex, dataToSet);
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
    (address systemAddress, ) = Systems.get(ResourceSelector.from(ROOT_NAMESPACE, REGISTRATION_SYSTEM_NAME));

    // We can't call IBaseWorld(this).registerSchema directly because it would be handled like
    // an external call, so msg.sender would be the address of the World contract
    Call.withSender({
      msgSender: msg.sender,
      target: systemAddress,
      funcSelectorAndArgs: abi.encodeWithSelector(
        IRegistrationSystem.registerTable.selector,
        tableSelector.getNamespace(),
        tableSelector.getFile(),
        valueSchema,
        keySchema
      ),
      delegate: false,
      value: 0
    });
  }

  /**
   * Register metadata (tableName, fieldNames) for the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function setMetadata(uint256 tableId, string calldata tableName, string[] calldata fieldNames) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    (address systemAddress, ) = Systems.get(ResourceSelector.from(ROOT_NAMESPACE, REGISTRATION_SYSTEM_NAME));

    // We can't call IBaseWorld(this).setMetadata directly because it would be handled like
    // an external call, so msg.sender would be the address of the World contract
    Call.withSender({
      msgSender: msg.sender,
      target: systemAddress,
      funcSelectorAndArgs: abi.encodeWithSelector(
        IRegistrationSystem.setMetadata.selector,
        resourceSelector.getNamespace(),
        resourceSelector.getFile(),
        tableName,
        fieldNames
      ),
      delegate: false,
      value: 0
    });
  }

  /**
   * Register a hook for the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   */
  function registerStoreHook(uint256 tableId, IStoreHook hook) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    (address systemAddress, ) = Systems.get(ResourceSelector.from(ROOT_NAMESPACE, REGISTRATION_SYSTEM_NAME));

    // We can't call IBaseWorld(this).registerStoreHook directly because it would be handled like
    // an external call, so msg.sender would be the address of the World contract
    Call.withSender({
      msgSender: msg.sender,
      target: systemAddress,
      funcSelectorAndArgs: abi.encodeWithSelector(
        IRegistrationSystem.registerTableHook.selector,
        resourceSelector.getNamespace(),
        resourceSelector.getFile(),
        hook
      ),
      delegate: false,
      value: 0
    });
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
   * Update data at `startByteIndex` of a field in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * The tableId is converted to a resourceSelector, and access is checked based on the namespace or file.
   */
  function updateInField(
    uint256 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet
  ) public virtual {
    bytes32 resourceSelector = ResourceSelector.from(tableId);
    updateInField(
      resourceSelector.getNamespace(),
      resourceSelector.getFile(),
      key,
      schemaIndex,
      startByteIndex,
      dataToSet
    );
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
  ) external payable virtual returns (bytes memory) {
    return _call(namespace, file, funcSelectorAndArgs, msg.value);
  }

  /**
   * Call the system at the given namespace and file and pass the given value.
   * If the system is not public, the caller must have access to the namespace or file.
   */
  function _call(
    bytes16 namespace,
    bytes16 file,
    bytes memory funcSelectorAndArgs,
    uint256 value
  ) internal virtual returns (bytes memory) {
    // Load the system data
    bytes32 resourceSelector = ResourceSelector.from(namespace, file);
    (address systemAddress, bool publicAccess) = Systems.get(resourceSelector);

    // Check if the system exists
    if (systemAddress == address(0)) revert ResourceNotFound(resourceSelector.toString());

    // Allow access if the system is public or the caller has access to the namespace or file
    if (!publicAccess) AccessControl.requireAccess(namespace, file, msg.sender);

    // Call the system and forward any return data
    return
      Call.withSender({
        msgSender: msg.sender,
        target: systemAddress,
        funcSelectorAndArgs: funcSelectorAndArgs,
        delegate: namespace == ROOT_NAMESPACE, // Use delegatecall for root systems (= registered in the root namespace)
        value: value
      });
  }

  /************************************************************************
   *
   *    DYNAMIC FUNCTION SELECTORS
   *
   ************************************************************************/

  /**
   * Allow the World to receive ETH
   */
  receive() external payable {}

  /**
   * Fallback function to call registered function selectors
   */
  fallback() external payable {
    (bytes16 namespace, bytes16 file, bytes4 systemFunctionSelector) = FunctionSelectors.get(msg.sig);

    if (namespace == 0 && file == 0) revert FunctionSelectorNotFound(msg.sig);

    // Replace function selector in the calldata with the system function selector
    bytes memory callData = Bytes.setBytes4(msg.data, 0, systemFunctionSelector);

    // Call the function and forward the call value
    bytes memory returnData = _call(namespace, file, callData, msg.value);
    assembly {
      return(add(returnData, 0x20), mload(returnData))
    }
  }
}
