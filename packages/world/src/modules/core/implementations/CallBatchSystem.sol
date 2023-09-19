// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "../../../System.sol";
import { IBaseWorld } from "../../../interfaces/IBaseWorld.sol";
import { revertWithBytes } from "../../../revertWithBytes.sol";
import { SystemCall } from "./SystemCall.sol";

contract CallBatchSystem is System {
  /**
   * Call multiple systems at the given resource selectors and return the array of return data.
   */
  function callBatch(SystemCall[] memory systemCalls) public returns (bytes[] memory datas) {
    IBaseWorld world = IBaseWorld(_world());
    datas = new bytes[](systemCalls.length);

    for (uint256 i; i < systemCalls.length; i++) {
      (bool success, bytes memory returnData) = address(world).delegatecall(
        abi.encodeCall(world.call, (systemCalls[i].systemId, systemCalls[i].callData))
      );
      if (!success) revertWithBytes(returnData);

      datas[i] = abi.decode(returnData, (bytes));
    }
  }
}
