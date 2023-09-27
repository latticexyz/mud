// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/**
 * @title System Hook Types
 * @dev This module provides constants for defining the different types of system hooks.
 * System hooks can be used to execute additional logic before or after system actions.
 */

/**
 * @notice Constant representing a hook that is triggered before a system call.
 * @dev This constant uses a bit-wise left shift for unique identification.
 */
uint8 constant BEFORE_CALL_SYSTEM = 1 << 0;

/**
 * @notice Constant representing a hook that is triggered after a system call.
 * @dev This constant uses a bit-wise left shift for unique identification.
 */
uint8 constant AFTER_CALL_SYSTEM = 1 << 1;

/**
 * @notice Constant representing all types of system hooks.
 * @dev It's a combination of all the system hook types.
 */
uint8 constant ALL = BEFORE_CALL_SYSTEM | AFTER_CALL_SYSTEM;
