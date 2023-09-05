// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceSelector } from "./ResourceSelector.sol";
import { WorldContextProvider } from "./WorldContext.sol";
import { AccessControl } from "./AccessControl.sol";
import { ResourceSelector } from "./ResourceSelector.sol";
import { ROOT_NAMESPACE } from "./constants.sol";
import { WorldContextProvider } from "./WorldContext.sol";
import { revertWithBytes } from "./revertWithBytes.sol";

import { IWorldErrors } from "./interfaces/IWorldErrors.sol";
import { ISystemHook } from "./interfaces/ISystemHook.sol";

import { FunctionSelectors } from "./modules/core/tables/FunctionSelectors.sol";
import { Systems } from "./modules/core/tables/Systems.sol";
import { SystemHooks } from "./modules/core/tables/SystemHooks.sol";

library SystemCall {
  using ResourceSelector for bytes32;

  /**
   * Calls a system via its resource selector and perform access control checks.
   * Does not revert if the call fails, but returns a `success` flag along with the returndata.
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
   * Calls a system via its resource selector, perform access control checks and trigger hooks registered for the system.
   * Does not revert if the call fails, but returns a `success` flag along with the returndata.
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
   * Calls a system via its resource selector, perform access control checks and trigger hooks registered for the system.
   * Reverts if the call fails.
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
