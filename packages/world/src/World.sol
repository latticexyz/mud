// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreRead } from "@latticexyz/store/src/StoreRead.sol";
import { IStoreData } from "@latticexyz/store/src/IStore.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { System } from "./System.sol";
import { ResourceSelector } from "./ResourceSelector.sol";
import { ROOT_NAMESPACE, ROOT_NAME } from "./constants.sol";
import { AccessControl } from "./AccessControl.sol";
import { SystemCall } from "./SystemCall.sol";
import { WorldContextProvider } from "./WorldContext.sol";
import { revertWithBytes } from "./revertWithBytes.sol";
import { Delegation } from "./Delegation.sol";

import { NamespaceOwner } from "./tables/NamespaceOwner.sol";
import { InstalledModules } from "./tables/InstalledModules.sol";
import { Delegations } from "./tables/Delegations.sol";

import { ISystemHook } from "./interfaces/ISystemHook.sol";
import { IModule } from "./interfaces/IModule.sol";
import { IWorldKernel } from "./interfaces/IWorldKernel.sol";
import { IDelegationControl } from "./interfaces/IDelegationControl.sol";

import { Systems } from "./modules/core/tables/Systems.sol";
import { SystemHooks } from "./modules/core/tables/SystemHooks.sol";
import { FunctionSelectors } from "./modules/core/tables/FunctionSelectors.sol";

contract World is StoreRead, IStoreData, IWorldKernel {
  using ResourceSelector for bytes32;

  constructor() {
    // Register internal NamespaceOwner table and give ownership of the root
    // namespace to msg.sender. This is done in the constructor instead of a
    // module, so that we can use it for access control checks in `installRootModule`.
    NamespaceOwner.register();
    NamespaceOwner.set(ROOT_NAMESPACE, msg.sender);

    // Other internal tables are registered by the CoreModule to reduce World's bytecode size.

    emit HelloWorld();
  }

  /**
   * Install the given root module in the World.
   * Requires the caller to own the root namespace.
   * The module is delegatecalled and installed in the root namespace.
   */
  function installRootModule(IModule module, bytes memory args) public {
    AccessControl.requireOwnerOrSelf(ROOT_NAMESPACE, msg.sender);

    WorldContextProvider.delegatecallWithContextOrRevert({
      msgSender: msg.sender,
      target: address(module),
      funcSelectorAndArgs: abi.encodeWithSelector(IModule.install.selector, args)
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
   * Write a record in the table at the given tableId.
   * Requires the caller to have access to the table's namespace or name (encoded in the tableId).
   */
  function setRecord(bytes32 tableId, bytes32[] calldata key, bytes calldata data, Schema valueSchema) public virtual {
    // Require access to the namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Set the record
    StoreCore.setRecord(tableId, key, data, valueSchema);
  }

  /**
   * Write a field in the table at the given tableId.
   * Requires the caller to have access to the table's namespace or name (encoded in the tableId).
   */
  function setField(
    bytes32 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data,
    Schema valueSchema
  ) public virtual {
    // Require access to namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Set the field
    StoreCore.setField(tableId, key, schemaIndex, data, valueSchema);
  }

  /**
   * Push data to the end of a field in the table at the given tableId.
   * Requires the caller to have access to the table's namespace or name (encoded in the tableId).
   */
  function pushToField(
    bytes32 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush,
    Schema valueSchema
  ) public virtual {
    // Require access to namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Push to the field
    StoreCore.pushToField(tableId, key, schemaIndex, dataToPush, valueSchema);
  }

  /**
   * Pop data from the end of a field in the table at the given tableId.
   * Requires the caller to have access to the table's namespace or name (encoded in the tableId).
   */
  function popFromField(
    bytes32 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 byteLengthToPop,
    Schema valueSchema
  ) public virtual {
    // Require access to namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Push to the field
    StoreCore.popFromField(tableId, key, schemaIndex, byteLengthToPop, valueSchema);
  }

  /**
   * Update data at `startByteIndex` of a field in the table at the given tableId.
   * Requires the caller to have access to the table's namespace or name (encoded in the tableId).
   */
  function updateInField(
    bytes32 tableId,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet,
    Schema valueSchema
  ) public virtual {
    // Require access to namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Update data in the field
    StoreCore.updateInField(tableId, key, schemaIndex, startByteIndex, dataToSet, valueSchema);
  }

  /**
   * Delete a record in the table at the given tableId.
   * Requires the caller to have access to the namespace or name.
   */
  function deleteRecord(bytes32 tableId, bytes32[] calldata key, Schema valueSchema) public virtual {
    // Require access to namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Delete the record
    StoreCore.deleteRecord(tableId, key, valueSchema);
  }

  /************************************************************************
   *
   *    SYSTEM CALLS
   *
   ************************************************************************/

  /**
   * Call the system at the given resourceSelector.
   * If the system is not public, the caller must have access to the namespace or name (encoded in the resourceSelector).
   */
  function call(
    bytes32 resourceSelector,
    bytes memory funcSelectorAndArgs
  ) external payable virtual returns (bytes memory) {
    return SystemCall.callWithHooksOrRevert(msg.sender, resourceSelector, funcSelectorAndArgs, msg.value);
  }

  /**
   * Call the system at the given resourceSelector on behalf of the given delegator.
   * If the system is not public, the delegator must have access to the namespace or name (encoded in the resourceSelector).
   */
  function callFrom(
    address delegator,
    bytes32 resourceSelector,
    bytes memory funcSelectorAndArgs
  ) external payable virtual returns (bytes memory) {
    // Check if there is an explicit authorization for this caller to perform actions on behalf of the delegator
    Delegation explicitDelegation = Delegation.wrap(Delegations.get({ delegator: delegator, delegatee: msg.sender }));

    if (explicitDelegation.verify(delegator, msg.sender, resourceSelector, funcSelectorAndArgs)) {
      // forward the call as `delegator`
      return SystemCall.callWithHooksOrRevert(delegator, resourceSelector, funcSelectorAndArgs, msg.value);
    }

    // Check if the delegator has a fallback delegation control set
    Delegation fallbackDelegation = Delegation.wrap(Delegations.get({ delegator: delegator, delegatee: address(0) }));
    if (fallbackDelegation.verify(delegator, msg.sender, resourceSelector, funcSelectorAndArgs)) {
      // forward the call with `from` as `msgSender`
      return SystemCall.callWithHooksOrRevert(delegator, resourceSelector, funcSelectorAndArgs, msg.value);
    }

    revert DelegationNotFound(delegator, msg.sender);
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
    (bytes32 resourceSelector, bytes4 systemFunctionSelector) = FunctionSelectors.get(msg.sig);

    if (resourceSelector == 0) revert FunctionSelectorNotFound(msg.sig);

    // Replace function selector in the calldata with the system function selector
    bytes memory callData = Bytes.setBytes4(msg.data, 0, systemFunctionSelector);

    // Call the function and forward the call data
    bytes memory returnData = SystemCall.callWithHooksOrRevert(msg.sender, resourceSelector, callData, msg.value);

    // If the call was successful, return the return data
    assembly {
      return(add(returnData, 0x20), mload(returnData))
    }
  }
}
