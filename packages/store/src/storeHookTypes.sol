// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/**
 * @title Record Management Flags
 * @notice Constants for flagging operations related to record manipulation.
 * @dev These flags can be used to signify before and after actions associated with various operations.
 */

/// @dev Flag representing an operation before setting a record.
uint8 constant BEFORE_SET_RECORD = 1 << 0;

/// @dev Flag representing an operation after setting a record.
uint8 constant AFTER_SET_RECORD = 1 << 1;

/// @dev Flag representing an operation before splicing static data.
uint8 constant BEFORE_SPLICE_STATIC_DATA = 1 << 2;

/// @dev Flag representing an operation after splicing static data.
uint8 constant AFTER_SPLICE_STATIC_DATA = 1 << 3;

/// @dev Flag representing an operation before splicing dynamic data.
uint8 constant BEFORE_SPLICE_DYNAMIC_DATA = 1 << 4;

/// @dev Flag representing an operation after splicing dynamic data.
uint8 constant AFTER_SPLICE_DYNAMIC_DATA = 1 << 5;

/// @dev Flag representing an operation before deleting a record.
uint8 constant BEFORE_DELETE_RECORD = 1 << 6;

/// @dev Flag representing an operation after deleting a record.
uint8 constant AFTER_DELETE_RECORD = 1 << 7;

/// @dev Flag representing all possible operations.
uint8 constant ALL = BEFORE_SET_RECORD |
  AFTER_SET_RECORD |
  BEFORE_SPLICE_STATIC_DATA |
  AFTER_SPLICE_STATIC_DATA |
  BEFORE_SPLICE_DYNAMIC_DATA |
  AFTER_SPLICE_DYNAMIC_DATA |
  BEFORE_DELETE_RECORD |
  AFTER_DELETE_RECORD;

/// @dev Flag grouping all "before" operations.
uint8 constant BEFORE_ALL = BEFORE_SET_RECORD |
  BEFORE_SPLICE_STATIC_DATA |
  BEFORE_SPLICE_DYNAMIC_DATA |
  BEFORE_DELETE_RECORD;

/// @dev Flag grouping all "after" operations.
uint8 constant AFTER_ALL = AFTER_SET_RECORD |
  AFTER_SPLICE_STATIC_DATA |
  AFTER_SPLICE_DYNAMIC_DATA |
  AFTER_DELETE_RECORD;
