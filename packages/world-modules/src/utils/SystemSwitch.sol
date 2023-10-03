// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Hook } from "@latticexyz/store/src/Hook.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";

import { IWorldKernel } from "@latticexyz/world/src/IWorldKernel.sol";
import { ResourceId, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { WorldContextProviderLib, WorldContextConsumerLib } from "@latticexyz/world/src/WorldContext.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";
import { ROOT_NAMESPACE } from "@latticexyz/world/src/constants.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";
import { BEFORE_CALL_SYSTEM, AFTER_CALL_SYSTEM } from "@latticexyz/world/src/systemHookTypes.sol";

import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { ISystemHook } from "@latticexyz/world/src/ISystemHook.sol";

import { FunctionSelectors } from "@latticexyz/world/src/codegen/tables/FunctionSelectors.sol";
import { Systems } from "@latticexyz/world/src/codegen/tables/Systems.sol";
import { SystemHooks } from "@latticexyz/world/src/codegen/tables/SystemHooks.sol";
import { Balances } from "@latticexyz/world/src/codegen/tables/Balances.sol";

/**
 * @title SystemSwitch
 * @dev The SystemSwitch library provides functions for interacting with systems from other systems.
 */
library SystemSwitch {
  using WorldResourceIdInstance for ResourceId;

  /**
   * @notice Calls a system identified by its Resource ID.
   * @dev Reverts if the system is not found, or if the system call reverts.
   * If the call is executed from the root context, the system is called directly via delegatecall.
   * Otherwise, the call is executed via an external call to the World contract.
   * @param systemId The unique Resource ID of the system being called.
   * @param callData The calldata to be executed in the system.
   * @return returnData The return data from the system call.
   */
  function call(ResourceId systemId, bytes memory callData) internal returns (bytes memory returnData) {
    address worldAddress = WorldContextConsumerLib._world();

    // If we're in the World context, call the system directly via delegatecall
    if (address(this) == worldAddress) {
      (address systemAddress, ) = Systems.get(systemId);
      // Check if the system exists
      if (systemAddress == address(0)) revert IWorldErrors.World_ResourceNotFound(systemId, systemId.toString());

      bool success;
      (success, returnData) = WorldContextProviderLib.delegatecallWithContext({
        msgSender: WorldContextConsumerLib._msgSender(),
        msgValue: WorldContextConsumerLib._msgValue(),
        target: systemAddress,
        callData: callData
      });

      if (!success) revertWithBytes(returnData);
      return returnData;
    }

    // Otherwise, call the system via world.call
    returnData = IWorldKernel(worldAddress).call(systemId, callData);
  }

  /**
   * @notice Calls a system via the function selector registered for it in the World contract.
   * @dev Reverts if the system is not found, or if the system call reverts.
   * If the call is executed from the root context, the system is called directly via delegatecall.
   * Otherwise, the call is executed via an external call to the World contract.
   * @param callData The world function selector, and call data to be forwarded to the system.
   * @return returnData The return data from the system call.
   */
  function call(bytes memory callData) internal returns (bytes memory returnData) {
    // Get the systemAddress and systemFunctionSelector from the worldFunctionSelector encoded in the calldata
    (ResourceId systemId, bytes4 systemFunctionSelector) = FunctionSelectors.get(bytes4(callData));

    // Revert if the function selector is not found
    if (ResourceId.unwrap(systemId) == 0) revert IWorldErrors.World_FunctionSelectorNotFound(msg.sig);

    // Replace function selector in the calldata with the system function selector, and call the system
    return call({ systemId: systemId, callData: Bytes.setBytes4(callData, 0, systemFunctionSelector) });
  }
}
