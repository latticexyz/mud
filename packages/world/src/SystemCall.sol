// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Hook } from "@latticexyz/store/src/Hook.sol";

import { ResourceSelector } from "./ResourceSelector.sol";
import { WorldContextProvider } from "./WorldContext.sol";
import { AccessControl } from "./AccessControl.sol";
import { ResourceSelector } from "./ResourceSelector.sol";
import { ROOT_NAMESPACE } from "./constants.sol";
import { WorldContextProvider } from "./WorldContext.sol";
import { revertWithBytes } from "./revertWithBytes.sol";
import { SystemHookType } from "./SystemHook.sol";

import { IWorldErrors } from "./interfaces/IWorldErrors.sol";
import { ISystemHook } from "./interfaces/ISystemHook.sol";

import { FunctionSelectors } from "./modules/core/tables/FunctionSelectors.sol";
import { Systems } from "./modules/core/tables/Systems.sol";
import { SystemHooks } from "./modules/core/tables/SystemHooks.sol";
import { Balances } from "./modules/core/tables/Balances.sol";

library SystemCall {
  using ResourceSelector for bytes32;

  /**
   * Calls a system via its resource selector and perform access control checks.
   * Does not revert if the call fails, but returns a `success` flag along with the returndata.
   */
  function call(
    address caller,
    uint256 value,
    bytes32 resourceSelector,
    bytes memory callData
  ) internal returns (bool success, bytes memory data) {
    // Load the system data
    (address systemAddress, bool publicAccess) = Systems._get(resourceSelector);

    // Check if the system exists
    if (systemAddress == address(0)) revert IWorldErrors.ResourceNotFound(resourceSelector.toString());

    // Allow access if the system is public or the caller has access to the namespace or name
    if (!publicAccess) AccessControl.requireAccess(resourceSelector, caller);

    // If the msg.value is non-zero, update the namespace's balance
    if (value > 0) {
      bytes16 namespace = resourceSelector.getNamespace();
      uint256 currentBalance = Balances._get(namespace);
      Balances._set(namespace, currentBalance + value);
    }

    // Call the system and forward any return data
    (success, data) = resourceSelector.getNamespace() == ROOT_NAMESPACE // Use delegatecall for root systems (= registered in the root namespace)
      ? WorldContextProvider.delegatecallWithContext({
        msgSender: caller,
        msgValue: value,
        target: systemAddress,
        callData: callData
      })
      : WorldContextProvider.callWithContext({
        msgSender: caller,
        msgValue: value,
        target: systemAddress,
        callData: callData
      });
  }

  /**
   * Calls a system via its resource selector, perform access control checks and trigger hooks registered for the system.
   * Does not revert if the call fails, but returns a `success` flag along with the returndata.
   */
  function callWithHooks(
    address caller,
    bytes32 resourceSelector,
    bytes memory callData,
    uint256 value
  ) internal returns (bool success, bytes memory data) {
    // Get system hooks
    bytes21[] memory hooks = SystemHooks._get(resourceSelector);

    // Call onBeforeCallSystem hooks (before calling the system)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(SystemHookType.BEFORE_CALL_SYSTEM))) {
        ISystemHook(hook.getAddress()).onBeforeCallSystem(caller, resourceSelector, callData);
      }
    }

    // Call the system and forward any return data
    (success, data) = call({ caller: caller, value: value, resourceSelector: resourceSelector, callData: callData });

    // Call onAfterCallSystem hooks (after calling the system)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(SystemHookType.AFTER_CALL_SYSTEM))) {
        ISystemHook(hook.getAddress()).onAfterCallSystem(caller, resourceSelector, callData);
      }
    }
  }

  /**
   * Calls a system via its resource selector, perform access control checks and trigger hooks registered for the system.
   * Reverts if the call fails.
   */
  function callWithHooksOrRevert(
    address caller,
    bytes32 resourceSelector,
    bytes memory callData,
    uint256 value
  ) internal returns (bytes memory data) {
    (bool success, bytes memory returnData) = callWithHooks({
      caller: caller,
      value: value,
      resourceSelector: resourceSelector,
      callData: callData
    });
    if (!success) revertWithBytes(returnData);
    return returnData;
  }
}
