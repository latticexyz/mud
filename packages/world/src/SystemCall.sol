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

library SystemCall {
  using WorldResourceIdInstance for ResourceId;

  /**
   * Calls a system via its ID and perform access control checks.
   * Does not revert if the call fails, but returns a `success` flag along with the returndata.
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
   * Calls a system via its ID, perform access control checks and trigger hooks registered for the system.
   * Does not revert if the call fails, but returns a `success` flag along with the returndata.
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
   * Calls a system via its ID, perform access control checks and trigger hooks registered for the system.
   * Reverts if the call fails.
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
