// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Store } from "@latticexyz/store/src/Store.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";

import { System } from "./System.sol";
import { ResourceSelector } from "./ResourceSelector.sol";
import { ROOT_NAMESPACE, ROOT_NAME, REGISTRATION_SYSTEM_NAME } from "./constants.sol";
import { AccessControl } from "./AccessControl.sol";
import { Call } from "./Call.sol";

import { NamespaceOwner } from "./tables/NamespaceOwner.sol";
import { Systems } from "./tables/Systems.sol";
import { FunctionSelectors } from "./tables/FunctionSelectors.sol";
import { InstalledModules } from "./tables/InstalledModules.sol";

import { IModule } from "./interfaces/IModule.sol";
import { IWorldData } from "./interfaces/IWorldData.sol";

contract World is Store, IWorldData {
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
   * Install the given root module in the World.
   * Requires the caller to own the root namespace.
   * The module is delegatecalled and installed in the root namespace.
   */
  function installRootModule(IModule module, bytes memory args) public {
    AccessControl.requireOwnerOrSelf(ROOT_NAMESPACE, ROOT_NAME, msg.sender);

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
   *    WORLD STORE METHODS
   *
   ************************************************************************/

  /**
   * Write a record in the table at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function setRecord(bytes16 namespace, bytes16 name, bytes32[] calldata key, bytes calldata data) public virtual {
    // Require access to the namespace or name
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, name, msg.sender);

    // Set the record
    StoreCore.setRecord(resourceSelector, key, data);
  }

  /**
   * Write a field in the table at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function setField(
    bytes16 namespace,
    bytes16 name,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data
  ) public virtual {
    // Require access to namespace or name
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, name, msg.sender);

    // Set the field
    StoreCore.setField(resourceSelector, key, schemaIndex, data);
  }

  /**
   * Push data to the end of a field in the table at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function pushToField(
    bytes16 namespace,
    bytes16 name,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush
  ) public virtual {
    // Require access to namespace or name
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, name, msg.sender);

    // Push to the field
    StoreCore.pushToField(resourceSelector, key, schemaIndex, dataToPush);
  }

  /**
   * Update data at `startByteIndex` of a field in the table at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function updateInField(
    bytes16 namespace,
    bytes16 name,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet
  ) public virtual {
    // Require access to namespace or name
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, name, msg.sender);

    // Update data in the field
    StoreCore.updateInField(resourceSelector, key, schemaIndex, startByteIndex, dataToSet);
  }

  /**
   * Delete a record in the table at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function deleteRecord(bytes16 namespace, bytes16 name, bytes32[] calldata key) public virtual {
    // Require access to namespace or name
    bytes32 resourceSelector = AccessControl.requireAccess(namespace, name, msg.sender);

    // Delete the record
    StoreCore.deleteRecord(resourceSelector, key);
  }

  /************************************************************************
   *
   *    STORE OVERRIDE METHODS
   *
   ************************************************************************/

  /**
   * Write a record in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * Access is checked based on the namespace or name (encoded in the tableId).
   */
  function setRecord(bytes32 tableId, bytes32[] calldata key, bytes calldata data) public virtual {
    setRecord(tableId.getNamespace(), tableId.getName(), key, data);
  }

  /**
   * Write a field in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * Access is checked based on the namespace or name (encoded in the tableId).
   */
  function setField(
    bytes32 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data
  ) public virtual override {
    setField(tableId.getNamespace(), tableId.getName(), key, schemaIndex, data);
  }

  /**
   * Push data to the end of a field in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * Access is checked based on the namespace or name (encoded in the tableId).
   */
  function pushToField(
    bytes32 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush
  ) public override {
    pushToField(tableId.getNamespace(), tableId.getName(), key, schemaIndex, dataToPush);
  }

  /**
   * Update data at `startByteIndex` of a field in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * Access is checked based on the namespace or name (encoded in the tableId).
   */
  function updateInField(
    bytes32 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet
  ) public virtual {
    updateInField(tableId.getNamespace(), tableId.getName(), key, schemaIndex, startByteIndex, dataToSet);
  }

  /**
   * Delete a record in the table at the given tableId.
   * This overload exists to conform with the `IStore` interface.
   * Access is checked based on the namespace or name (encoded in the tableId).
   */
  function deleteRecord(bytes32 tableId, bytes32[] calldata key) public virtual override {
    deleteRecord(tableId.getNamespace(), tableId.getName(), key);
  }

  /************************************************************************
   *
   *    SYSTEM CALLS
   *
   ************************************************************************/

  /**
   * Call the system at the given namespace and name.
   * If the system is not public, the caller must have access to the namespace or name.
   */
  function call(
    bytes16 namespace,
    bytes16 name,
    bytes memory funcSelectorAndArgs
  ) external payable virtual returns (bytes memory) {
    return _call(namespace, name, funcSelectorAndArgs, msg.value);
  }

  /**
   * Call the system at the given namespace and name and pass the given value.
   * If the system is not public, the caller must have access to the namespace or name.
   */
  function _call(
    bytes16 namespace,
    bytes16 name,
    bytes memory funcSelectorAndArgs,
    uint256 value
  ) internal virtual returns (bytes memory) {
    // Load the system data
    bytes32 resourceSelector = ResourceSelector.from(namespace, name);
    (address systemAddress, bool publicAccess) = Systems.get(resourceSelector);

    // Check if the system exists
    if (systemAddress == address(0)) revert ResourceNotFound(resourceSelector.toString());

    // Allow access if the system is public or the caller has access to the namespace or name
    if (!publicAccess) AccessControl.requireAccess(namespace, name, msg.sender);

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
    (bytes16 namespace, bytes16 name, bytes4 systemFunctionSelector) = FunctionSelectors.get(msg.sig);

    if (namespace == 0 && name == 0) revert FunctionSelectorNotFound(msg.sig);

    // Replace function selector in the calldata with the system function selector
    bytes memory callData = Bytes.setBytes4(msg.data, 0, systemFunctionSelector);

    // Call the function and forward the call value
    bytes memory returnData = _call(namespace, name, callData, msg.value);
    assembly {
      return(add(returnData, 0x20), mload(returnData))
    }
  }
}
