// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "../../../System.sol";
import { IBaseWorld } from "../../../codegen/interfaces/IBaseWorld.sol";
import { revertWithBytes } from "../../../revertWithBytes.sol";

import { SystemCallData, SystemCallFromData } from "../types.sol";

/**
 * @title Batch Call System
 * @dev A system contract that facilitates batching of calls to various systems in a single transaction.
 */
contract BatchCallSystem is System {
  /**
   * @notice Make batch calls to multiple systems into a single transaction.
   * @dev Iterates through an array of system calls, executes them, and returns an array of return data.
   * @param systemCalls An array of SystemCallData that contains systemId and callData for each call.
   * @return returnDatas An array of bytes containing the return data for each system call.
   */
  function batchCall(SystemCallData[] calldata systemCalls) public returns (bytes[] memory returnDatas) {
    IBaseWorld world = IBaseWorld(_world());
    returnDatas = new bytes[](systemCalls.length);

    for (uint256 i; i < systemCalls.length; i++) {
      (bool success, bytes memory returnData) = address(world).delegatecall(
        abi.encodeCall(world.call, (systemCalls[i].systemId, systemCalls[i].callData))
      );
      if (!success) revertWithBytes(returnData);

      returnDatas[i] = abi.decode(returnData, (bytes));
    }
  }

  /**
   * @notice Make batch calls from specific addresses to multiple systems in a single transaction.
   * @dev Iterates through an array of system calls with specified 'from' addresses, executes them, and returns an array of return data.
   * @param systemCalls An array of SystemCallFromData that contains from, systemId, and callData for each call.
   * @return returnDatas An array of bytes containing the return data for each system call.
   */
  function batchCallFrom(SystemCallFromData[] calldata systemCalls) public returns (bytes[] memory returnDatas) {
    IBaseWorld world = IBaseWorld(_world());
    returnDatas = new bytes[](systemCalls.length);

    for (uint256 i; i < systemCalls.length; i++) {
      (bool success, bytes memory returnData) = address(world).delegatecall(
        abi.encodeCall(world.callFrom, (systemCalls[i].from, systemCalls[i].systemId, systemCalls[i].callData))
      );
      if (!success) revertWithBytes(returnData);

      returnDatas[i] = abi.decode(returnData, (bytes));
    }
  }
}
