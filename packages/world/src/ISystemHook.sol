// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IERC165 } from "./IERC165.sol";
import { ResourceId } from "./WorldResourceId.sol";

/**
 * @title ISystemHook
 * @dev Interface defining system hooks for external functionality.
 * Provides pre and post hooks that can be triggered before and after a system call respectively.
 * This interface adheres to the ERC-165 standard for determining interface support.
 */
interface ISystemHook is IERC165 {
  /**
   * @notice Executes before a system call.
   * @dev Provides the ability to add custom logic or checks before a system is invoked.
   * @param msgSender The original sender of the system call.
   * @param systemId The identifier for the system being called.
   * @param callData Data being sent as part of the system call.
   */
  function onBeforeCallSystem(address msgSender, ResourceId systemId, bytes memory callData) external;

  /**
   * @notice Executes after a system call.
   * @dev Provides the ability to add custom logic or checks after a system call completes.
   * @param msgSender The original sender of the system call.
   * @param systemId The identifier for the system that was called.
   * @param callData Data that was sent as part of the system call.
   */
  function onAfterCallSystem(address msgSender, ResourceId systemId, bytes memory callData) external;
}
