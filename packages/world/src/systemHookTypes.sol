// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/**
 * @title System Hook Types
 * @dev This file provides constants for defining the different types of system hooks.
 * System hooks can be used to execute additional logic before or after system actions.
 */

/**
 * @dev Constant representing a hook that is triggered before a system call.
 */
uint8 constant BEFORE_CALL_SYSTEM = 1 << 0;

/**
 * @dev Constant representing a hook that is triggered after a system call.
 */
uint8 constant AFTER_CALL_SYSTEM = 1 << 1;

/**
 * @dev Constant representing all types of system hooks.
 * It's a bitmap with flags from all system hook types enabled.
 */
uint8 constant ALL = BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM;
