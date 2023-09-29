// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/**
 * @title Store Hook Flags
 * @notice Constants for enabling store hooks.
 * @dev These bitmaps can be used to enable selected store hooks. They can be combined with a bitwise OR (`|`).
 */

/// @dev Flag to enable the `onBeforeSetRecord` hook.
uint8 constant BEFORE_SET_RECORD = 1 << 0;

/// @dev Flag to enable the `afterSetRecord` hook.
uint8 constant AFTER_SET_RECORD = 1 << 1;

/// @dev Flag to enable the `beforeSpliceStaticData` hook.
uint8 constant BEFORE_SPLICE_STATIC_DATA = 1 << 2;

/// @dev Flag to enable the `afterSpliceStaticData` hook.
uint8 constant AFTER_SPLICE_STATIC_DATA = 1 << 3;

/// @dev Flag to enable the `beforeSpliceDynamicData` hook.
uint8 constant BEFORE_SPLICE_DYNAMIC_DATA = 1 << 4;

/// @dev Flag to enable the `afterSpliceDynamicData` hook.
uint8 constant AFTER_SPLICE_DYNAMIC_DATA = 1 << 5;

/// @dev Flag to enable the `beforeDeleteRecord` hook.
uint8 constant BEFORE_DELETE_RECORD = 1 << 6;

/// @dev Flag to enable the `afterDeleteRecord` hook.
uint8 constant AFTER_DELETE_RECORD = 1 << 7;

/// @dev Bitmap to enable all hooks.
uint8 constant ALL = BEFORE_SET_RECORD |
  AFTER_SET_RECORD |
  BEFORE_SPLICE_STATIC_DATA |
  AFTER_SPLICE_STATIC_DATA |
  BEFORE_SPLICE_DYNAMIC_DATA |
  AFTER_SPLICE_DYNAMIC_DATA |
  BEFORE_DELETE_RECORD |
  AFTER_DELETE_RECORD;

/// @dev Bitmap to enable all "before" hooks.
uint8 constant BEFORE_ALL = BEFORE_SET_RECORD |
  BEFORE_SPLICE_STATIC_DATA |
  BEFORE_SPLICE_DYNAMIC_DATA |
  BEFORE_DELETE_RECORD;

/// @dev Bitmap to enable all "after" hooks.
uint8 constant AFTER_ALL = AFTER_SET_RECORD |
  AFTER_SPLICE_STATIC_DATA |
  AFTER_SPLICE_DYNAMIC_DATA |
  AFTER_DELETE_RECORD;
