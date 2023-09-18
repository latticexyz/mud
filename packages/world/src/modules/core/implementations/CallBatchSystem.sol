// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "../../../System.sol";
import { IBaseWorld } from "../../../interfaces/IBaseWorld.sol";
import { revertWithBytes } from "../../../revertWithBytes.sol";

/**
 * Call multiple systems at the given resourceSelectors, on behalf of _msgSender().
 */
contract CallBatchSystem is System {
  function callBatch(
    bytes32[] memory resourceSelectors,
    bytes[] memory callDatas
  ) public returns (bytes[] memory datas) {
    IBaseWorld world = IBaseWorld(_world());
    datas = new bytes[](resourceSelectors.length);

    for (uint256 i; i < resourceSelectors.length; i++) {
      (bool success, bytes memory returnData) = address(world).delegatecall(
        abi.encodeCall(world.call, (resourceSelectors[i], callDatas[i]))
      );
      if (!success) revertWithBytes(returnData);

      datas[i] = abi.decode(returnData, (bytes));
    }
  }
}
