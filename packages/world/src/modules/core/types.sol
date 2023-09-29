// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

/**
 * @title System Call Data Structure
 * @notice Holds data for making system calls.
 * @dev Used to represent a call to a specific system identified by a ResourceId.
 */
struct SystemCallData {
  /// @dev The ID of the system to call.
  ResourceId systemId;
  /// @dev The call data to pass to the system function.
  bytes callData;
}

/**
 * @title System Call From Data Structure
 * @notice Holds data for making system calls with a specific sender.
 * @dev Used to represent a call from a specific address to a specific system.
 */
struct SystemCallFromData {
  /// @dev The address from which the system call is made.
  address from;
  /// @dev The ID of the system to call.
  ResourceId systemId;
  /// @dev The call data to pass to the system function.
  bytes callData;
}
