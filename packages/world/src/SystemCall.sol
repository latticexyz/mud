// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Hook } from "@latticexyz/store/src/Hook.sol";

import { ResourceId, WorldResourceIdInstance } from "./WorldResourceId.sol";
import { WorldContextProviderLib } from "./WorldContext.sol";
import { AccessControl } from "./AccessControl.sol";
import { ROOT_NAMESPACE } from "./constants.sol";
import { WorldContextProviderLib } from "./WorldContext.sol";
import { revertWithBytes } from "./revertWithBytes.sol";
import { BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "./systemHookTypes.sol";

import { IWorldErrors } from "./IWorldErrors.sol";
import { ISystemHook } from "./ISystemHook.sol";

import { FunctionSelectors } from "./codegen/tables/FunctionSelectors.sol";
import { Systems } from "./codegen/tables/Systems.sol";
import { SystemHooks } from "./codegen/tables/SystemHooks.sol";
import { Balances } from "./codegen/tables/Balances.sol";

/**
 * @title SystemCall
 * @dev The SystemCall library provides functions for interacting with systems using their unique Resource IDs.
 * It ensures the necessary access control checks, handles system hooks, and performs system calls.
 */
library SystemCall {
  using WorldResourceIdInstance for ResourceId;

  /**
   * @notice Calls a system identified by its Resource ID while ensuring necessary access controls.
   * @dev This function does not revert if the system call fails. Instead, it returns a success flag.
   * @param caller The address initiating the system call.
   * @param value The amount of Ether to be sent with the call.
   * @param systemId The unique Resource ID of the system being called.
   * @param callData The calldata to be executed in the system.
   * @return success A flag indicating whether the system call was successful.
   * @return data The return data from the system call.
   */
  function call(
    address caller,
    uint256 value,
    ResourceId systemId,
    bytes memory callData
  ) internal returns (bool success, bytes memory data) {
    // Load the system data
    (address systemAddress, bool publicAccess) = Systems._get(systemId);

    // Check if the system exists
    if (systemAddress == address(0)) revert IWorldErrors.World_ResourceNotFound(systemId, systemId.toString());

    // Allow access if the system is public or the caller has access to the namespace or name
    if (!publicAccess) AccessControl.requireAccess(systemId, caller);

    // If the msg.value is non-zero, update the namespace's balance
    if (value > 0) {
      ResourceId namespaceId = systemId.getNamespaceId();
      uint256 currentBalance = Balances._get(namespaceId);
      Balances._set(namespaceId, currentBalance + value);
    }

    // Call the system and forward any return data
    (success, data) = systemId.getNamespace() == ROOT_NAMESPACE // Use delegatecall for root systems (= registered in the root namespace)
      ? WorldContextProviderLib.delegatecallWithContext({
        msgSender: caller,
        msgValue: value,
        target: systemAddress,
        callData: callData
      })
      : WorldContextProviderLib.callWithContext({
        msgSender: caller,
        msgValue: value,
        target: systemAddress,
        callData: callData
      });
  }

  /**
   * @notice Calls a system identified by its Resource ID, ensuring access controls, and triggers associated system hooks.
   * @dev This function does not revert if the system call fails. Instead, it returns a success flag.
   * @param caller The address initiating the system call.
   * @param systemId The unique Resource ID of the system being called.
   * @param callData The calldata to be executed in the system.
   * @param value The amount of Ether to be sent with the call.
   * @return success A flag indicating whether the system call was successful.
   * @return data The return data from the system call.
   */
  function callWithHooks(
    address caller,
    ResourceId systemId,
    bytes memory callData,
    uint256 value
  ) internal returns (bool success, bytes memory data) {
    // Get system hooks
    bytes21[] memory hooks = SystemHooks._get(systemId);

    // Call onBeforeCallSystem hooks (before calling the system)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(BEFORE_CALL_SYSTEM)) {
        ISystemHook(hook.getAddress()).onBeforeCallSystem(caller, systemId, callData);
      }
    }

    // Call the system and forward any return data
    (success, data) = call({ caller: caller, value: value, systemId: systemId, callData: callData });

    // Call onAfterCallSystem hooks (after calling the system)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(AFTER_CALL_SYSTEM)) {
        ISystemHook(hook.getAddress()).onAfterCallSystem(caller, systemId, callData);
      }
    }
  }

  /**
   * @notice Calls a system identified by its Resource ID, ensures access controls, triggers associated system hooks, and reverts on failure.
   * @param caller The address initiating the system call.
   * @param systemId The unique Resource ID of the system being called.
   * @param callData The calldata to be executed in the system.
   * @param value The amount of Ether to be sent with the call.
   * @return data The return data from the system call.
   */
  function callWithHooksOrRevert(
    address caller,
    ResourceId systemId,
    bytes memory callData,
    uint256 value
  ) internal returns (bytes memory data) {
    (bool success, bytes memory returnData) = callWithHooks({
      caller: caller,
      value: value,
      systemId: systemId,
      callData: callData
    });
    if (!success) revertWithBytes(returnData);
    return returnData;
  }
}
