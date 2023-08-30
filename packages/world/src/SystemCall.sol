// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceSelector } from "./ResourceSelector.sol";
import { WorldContextProvider } from "./WorldContext.sol";
import { AccessControl } from "./AccessControl.sol";
import { ResourceSelector } from "./ResourceSelector.sol";
import { ROOT_NAMESPACE } from "./constants.sol";
import { WorldContextProvider } from "./WorldContext.sol";
import { revertWithBytes } from "./utils.sol";

import { IWorldErrors } from "./interfaces/IWorldErrors.sol";
import { ISystemHook } from "./interfaces/ISystemHook.sol";

import { FunctionSelectors } from "./modules/core/tables/FunctionSelectors.sol";
import { Systems } from "./modules/core/tables/Systems.sol";
import { SystemHooks } from "./modules/core/tables/SystemHooks.sol";

library SystemCall {
  using ResourceSelector for bytes32;

  /**
   * Call the system at the given namespace.
   * If the system is not public, the caller must have access to the namespace or name.
   * Returns the success status and any return data.
   */
  function call(
    address caller,
    bytes32 resourceSelector,
    bytes memory funcSelectorAndArgs,
    uint256 value
  ) internal returns (bool success, bytes memory data) {
    // Load the system data
    (address systemAddress, bool publicAccess) = Systems.get(resourceSelector);

    // Check if the system exists
    if (systemAddress == address(0)) revert IWorldErrors.ResourceNotFound(resourceSelector.toString());

    // Allow access if the system is public or the caller has access to the namespace or name
    if (!publicAccess) AccessControl.requireAccess(resourceSelector, caller);

    // Call the system and forward any return data
    (success, data) = resourceSelector.getNamespace() == ROOT_NAMESPACE // Use delegatecall for root systems (= registered in the root namespace)
      ? WorldContextProvider.delegatecallWithContext({
        msgSender: caller,
        target: systemAddress,
        funcSelectorAndArgs: funcSelectorAndArgs
      })
      : WorldContextProvider.callWithContext({
        msgSender: caller,
        target: systemAddress,
        funcSelectorAndArgs: funcSelectorAndArgs,
        value: value
      });
  }

  /**
   * Call the system at the given namespace and call any hooks registered for it.
   * If the system is not public, the caller must have access to the namespace or name.
   * Returns the success status and any return data.
   */
  function callWithHooks(
    address caller,
    bytes32 resourceSelector,
    bytes memory funcSelectorAndArgs,
    uint256 value
  ) internal returns (bool success, bytes memory data) {
    // Get system hooks
    address[] memory hooks = SystemHooks.get(resourceSelector);

    // Call onBeforeCallSystem hooks (before calling the system)
    for (uint256 i; i < hooks.length; i++) {
      ISystemHook hook = ISystemHook(hooks[i]);
      hook.onBeforeCallSystem(caller, resourceSelector, funcSelectorAndArgs);
    }

    // Call the system and forward any return data
    (success, data) = call(caller, resourceSelector, funcSelectorAndArgs, value);

    // Call onAfterCallSystem hooks (after calling the system)
    for (uint256 i; i < hooks.length; i++) {
      ISystemHook hook = ISystemHook(hooks[i]);
      hook.onAfterCallSystem(caller, resourceSelector, funcSelectorAndArgs);
    }
  }

  /**
   * Call the system at the given namespace and call any hooks registered for it.
   * If the system is not public, the caller must have access to the namespace or name.
   * Reverts with the error if the call was not successful.
   * Else returns any return data.
   */
  function callWithHooksOrRevert(
    address caller,
    bytes32 resourceSelector,
    bytes memory funcSelectorAndArgs,
    uint256 value
  ) internal returns (bytes memory data) {
    (bool success, bytes memory returnData) = callWithHooks(caller, resourceSelector, funcSelectorAndArgs, value);
    if (!success) revertWithBytes(returnData);
    return returnData;
  }
}
