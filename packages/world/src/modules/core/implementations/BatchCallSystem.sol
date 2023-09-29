// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "../../../System.sol";
import { IBaseWorld } from "../../../codegen/interfaces/IBaseWorld.sol";
import { revertWithBytes } from "../../../revertWithBytes.sol";

import { SystemCallData, SystemCallFromData } from "../types.sol";

contract BatchCallSystem is System {
  /**
   * Batch calls to multiple systems into a single transaction, return the array of return data.
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
   * Batch calls to multiple systems into a single transaction, return the array of return data.
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
