// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { StoreData } from "@latticexyz/store/src/StoreData.sol";
import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";

import { WORLD_VERSION } from "./version.sol";
import { System } from "./System.sol";
import { ResourceId, WorldResourceIdInstance } from "./WorldResourceId.sol";
import { ROOT_NAMESPACE_ID, ROOT_NAMESPACE, ROOT_NAME } from "./constants.sol";
import { AccessControl } from "./AccessControl.sol";
import { SystemCall } from "./SystemCall.sol";
import { WorldContextProviderLib } from "./WorldContext.sol";
import { revertWithBytes } from "./revertWithBytes.sol";
import { Delegation } from "./Delegation.sol";
import { requireInterface } from "./requireInterface.sol";

import { NamespaceOwner } from "./codegen/tables/NamespaceOwner.sol";
import { InstalledModules } from "./codegen/tables/InstalledModules.sol";
import { UserDelegationControl } from "./codegen/tables/UserDelegationControl.sol";
import { NamespaceDelegationControl } from "./codegen/tables/NamespaceDelegationControl.sol";

import { IModule, MODULE_INTERFACE_ID } from "./IModule.sol";
import { IWorldKernel } from "./IWorldKernel.sol";
import { IDelegationControl } from "./IDelegationControl.sol";

import { Systems } from "./codegen/tables/Systems.sol";
import { SystemHooks } from "./codegen/tables/SystemHooks.sol";
import { FunctionSelectors } from "./codegen/tables/FunctionSelectors.sol";
import { Balances } from "./codegen/tables/Balances.sol";
import { CORE_MODULE_NAME } from "./modules/core/constants.sol";

/**
 * @title World Contract
 * @dev This contract is the core "World" contract containing various methods for
 * data manipulation, system calls, and dynamic function selector handling.
 */
contract World is StoreData, IWorldKernel {
  using WorldResourceIdInstance for ResourceId;

  /// @notice Address of the contract's creator.
  address public immutable creator;

  /// @return The current version of the world contract.
  function worldVersion() public pure returns (bytes32) {
    return WORLD_VERSION;
  }

  /// @dev Event emitted when the World contract is created.
  constructor() {
    creator = msg.sender;
    emit HelloWorld(WORLD_VERSION);
  }

  /**
   * @dev Prevents the World contract from calling itself.
   */
  modifier requireNoCallback() {
    if (msg.sender == address(this)) {
      revert World_CallbackNotAllowed(msg.sig);
    }
    _;
  }

  /**
   * @notice Initializes the World by installing the core module.
   * @param coreModule The core module to initialize the World with.
   * @dev Only the initial creator can initialize. This can be done only once.
   */
  function initialize(IModule coreModule) public requireNoCallback {
    // Only the initial creator of the World can initialize it
    if (msg.sender != creator) {
      revert World_AccessDenied(ROOT_NAMESPACE_ID.toString(), msg.sender);
    }

    // The World can only be initialized once
    if (InstalledModules._get(CORE_MODULE_NAME, keccak256("")) != address(0)) {
      revert World_AlreadyInitialized();
    }

    // Initialize the World by installing the core module
    _installRootModule(coreModule, new bytes(0));
  }

  /**
   * @notice Installs a given root module in the World.
   * @param module The module to be installed.
   * @param args Arguments for module installation.
   * @dev The caller must own the root namespace.
   */
  function installRootModule(IModule module, bytes memory args) public requireNoCallback {
    AccessControl.requireOwner(ROOT_NAMESPACE_ID, msg.sender);
    _installRootModule(module, args);
  }

  /**
   * @dev Internal function to install a root module.
   * @param module The module to be installed.
   * @param args Arguments for module installation.
   */
  function _installRootModule(IModule module, bytes memory args) internal {
    // Require the provided address to implement the IModule interface
    requireInterface(address(module), MODULE_INTERFACE_ID);

    WorldContextProviderLib.delegatecallWithContextOrRevert({
      msgSender: msg.sender,
      msgValue: 0,
      target: address(module),
      callData: abi.encodeCall(IModule.installRoot, (args))
    });

    // Register the module in the InstalledModules table
    InstalledModules._set(module.getName(), keccak256(args), address(module));
  }

  /************************************************************************
   *
   *    WORLD STORE METHODS
   *
   ************************************************************************/

  /**
   * @notice Writes a record in the table identified by `tableId`.
   * @param tableId The unique identifier for the table.
   * @param keyTuple Array of keys identifying the record.
   * @param staticData Static data (fixed length fields) of the record.
   * @param encodedLengths Encoded lengths of data.
   * @param dynamicData Dynamic data (variable length fields) of the record.
   * @dev Requires the caller to have access to the table's namespace or name (encoded in the tableId).
   */
  function setRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    bytes calldata staticData,
    PackedCounter encodedLengths,
    bytes calldata dynamicData
  ) public virtual requireNoCallback {
    // Require access to the namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Set the record
    StoreCore.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
  }

  /**
   * @notice Modifies static (fixed length) data in a record at the specified position.
   * @param tableId The unique identifier for the table.
   * @param keyTuple Array of keys identifying the record.
   * @param start Position from where the static data modification should start.
   * @param data Data to splice into the static data of the record.
   */
  function spliceStaticData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint48 start,
    bytes calldata data
  ) public virtual requireNoCallback {
    // Require access to the namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Splice the static data
    StoreCore.spliceStaticData(tableId, keyTuple, start, data);
  }

  /**
   * @notice Modifies dynamic (variable length) data in a record for a specified field.
   * @param tableId The unique identifier for the table.
   * @param keyTuple Array of keys identifying the record.
   * @param dynamicFieldIndex Index of the dynamic field to modify.
   * @param startWithinField Start position within the specified dynamic field.
   * @param deleteCount Number of bytes to delete starting from the `startWithinField`.
   * @param data Data to splice into the dynamic data of the field.
   */
  function spliceDynamicData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes calldata data
  ) public virtual requireNoCallback {
    // Require access to the namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Splice the dynamic data
    StoreCore.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data);
  }

  /**
   * @notice Writes data into a specified field in the table identified by `tableId`.
   * @param tableId The unique identifier for the table.
   * @param keyTuple Array of keys identifying the record.
   * @param fieldIndex Index of the field to modify.
   * @param data Data to write into the specified field.
   */
  function setField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data
  ) public virtual requireNoCallback {
    // Require access to namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Set the field
    StoreCore.setField(tableId, keyTuple, fieldIndex, data);
  }

  /**
   * @notice Writes data into a specified field in the table, adhering to a specific layout.
   * @param tableId The unique identifier for the table.
   * @param keyTuple Array of keys identifying the record.
   * @param fieldIndex Index of the field to modify.
   * @param data Data to write into the specified field.
   * @param fieldLayout The layout to adhere to when modifying the field.
   */
  function setField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public virtual requireNoCallback {
    // Require access to namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Set the field
    StoreCore.setField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  /**
   * @notice Writes data into a static (fixed length) field in the table identified by `tableId`.
   * @param tableId The unique identifier for the table.
   * @param keyTuple Array of keys identifying the record.
   * @param fieldIndex Index of the static field to modify.
   * @param data Data to write into the specified static field.
   * @param fieldLayout The layout to adhere to when modifying the field.
   * @dev Requires the caller to have access to the table's namespace or name (encoded in the tableId).
   */
  function setStaticField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public virtual requireNoCallback {
    // Require access to namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Set the field
    StoreCore.setStaticField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  /**
   * @notice Writes data into a dynamic (varible length) field in the table identified by `tableId`.
   * @param tableId The unique identifier for the table.
   * @param keyTuple Array of keys identifying the record.
   * @param dynamicFieldIndex Index of the dynamic field to modify.
   * @param data Data to write into the specified dynamic field.
   */
  function setDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata data
  ) public virtual requireNoCallback {
    // Require access to namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Set the field
    StoreCore.setDynamicField(tableId, keyTuple, dynamicFieldIndex, data);
  }

  /**
   * @notice Appends data to the end of a dynamic (variable length) field in the table identified by `tableId`.
   * @param tableId The unique identifier for the table.
   * @param keyTuple Array of keys identifying the record.
   * @param dynamicFieldIndex Index of the dynamic field to append to.
   * @param dataToPush Data to append to the specified dynamic field.
   */
  function pushToDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata dataToPush
  ) public virtual requireNoCallback {
    // Require access to namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Push to the field
    StoreCore.pushToDynamicField(tableId, keyTuple, dynamicFieldIndex, dataToPush);
  }

  /**
   * @notice Removes a specified amount of data from the end of a dynamic (variable length) field in the table identified by `tableId`.
   * @param tableId The unique identifier for the table.
   * @param keyTuple Array of keys identifying the record.
   * @param dynamicFieldIndex Index of the dynamic field to remove data from.
   * @param byteLengthToPop The number of bytes to remove from the end of the dynamic field.
   */
  function popFromDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint256 byteLengthToPop
  ) public virtual requireNoCallback {
    // Require access to namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Push to the field
    StoreCore.popFromDynamicField(tableId, keyTuple, dynamicFieldIndex, byteLengthToPop);
  }

  /**
   * @notice Deletes a record from the table identified by `tableId`.
   * @param tableId The unique identifier for the table.
   * @param keyTuple Array of keys identifying the record to delete.
   * @dev Requires the caller to have access to the table's namespace or name.
   */
  function deleteRecord(ResourceId tableId, bytes32[] calldata keyTuple) public virtual requireNoCallback {
    // Require access to namespace or name
    AccessControl.requireAccess(tableId, msg.sender);

    // Delete the record
    StoreCore.deleteRecord(tableId, keyTuple);
  }

  /************************************************************************
   *
   *    SYSTEM CALLS
   *
   ************************************************************************/

  /**
   * @notice Calls a system with a given system ID.
   * @param systemId The ID of the system to be called.
   * @param callData The data for the system call.
   * @return Return data from the system call.
   * @dev If system is private, caller must have appropriate access.
   */
  function call(
    ResourceId systemId,
    bytes memory callData
  ) external payable virtual requireNoCallback returns (bytes memory) {
    return SystemCall.callWithHooksOrRevert(msg.sender, systemId, callData, msg.value);
  }

  /**
   * @notice Calls a system with a given system ID on behalf of the given delegator.
   * @param delegator The address on whose behalf the system is called.
   * @param systemId The ID of the system to be called.
   * @param callData The ABI data for the system call.
   * @return Return data from the system call.
   * @dev If system is private, caller must have appropriate access.
   */
  function callFrom(
    address delegator,
    ResourceId systemId,
    bytes memory callData
  ) external payable virtual requireNoCallback returns (bytes memory) {
    // If the delegator is the caller, call the system directly
    if (delegator == msg.sender) {
      return SystemCall.callWithHooksOrRevert(msg.sender, systemId, callData, msg.value);
    }

    // Check if there is an individual authorization for this caller to perform actions on behalf of the delegator
    ResourceId individualDelegationId = UserDelegationControl._get({ delegator: delegator, delegatee: msg.sender });

    if (Delegation.verify(individualDelegationId, delegator, msg.sender, systemId, callData)) {
      // forward the call as `delegator`
      return SystemCall.callWithHooksOrRevert(delegator, systemId, callData, msg.value);
    }

    // Check if the delegator has a fallback delegation control set
    ResourceId userFallbackDelegationId = UserDelegationControl._get({ delegator: delegator, delegatee: address(0) });
    if (Delegation.verify(userFallbackDelegationId, delegator, msg.sender, systemId, callData)) {
      // forward the call as `delegator`
      return SystemCall.callWithHooksOrRevert(delegator, systemId, callData, msg.value);
    }

    // Check if the namespace has a fallback delegation control set
    ResourceId namespaceFallbackDelegationId = NamespaceDelegationControl._get(systemId.getNamespaceId());
    if (Delegation.verify(namespaceFallbackDelegationId, delegator, msg.sender, systemId, callData)) {
      // forward the call as `delegator`
      return SystemCall.callWithHooksOrRevert(delegator, systemId, callData, msg.value);
    }

    revert World_DelegationNotFound(delegator, msg.sender);
  }

  /************************************************************************
   *
   *    DYNAMIC FUNCTION SELECTORS
   *
   ************************************************************************/

  /**
   * @notice Accepts ETH and adds to the root namespace's balance.
   */
  receive() external payable {
    uint256 rootBalance = Balances._get(ROOT_NAMESPACE_ID);
    Balances._set(ROOT_NAMESPACE_ID, rootBalance + msg.value);
  }

  /**
   * @dev Fallback function to call registered function selectors.
   */
  fallback() external payable requireNoCallback {
    (ResourceId systemId, bytes4 systemFunctionSelector) = FunctionSelectors._get(msg.sig);

    if (ResourceId.unwrap(systemId) == 0) revert World_FunctionSelectorNotFound(msg.sig);

    // Replace function selector in the calldata with the system function selector
    bytes memory callData = Bytes.setBytes4(msg.data, 0, systemFunctionSelector);

    // Call the function and forward the call data
    bytes memory returnData = SystemCall.callWithHooksOrRevert(msg.sender, systemId, callData, msg.value);

    // If the call was successful, return the return data
    assembly {
      return(add(returnData, 0x20), mload(returnData))
    }
  }
}
