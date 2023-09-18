// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "../../System.sol";
import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { revertWithBytes } from "../../revertWithBytes.sol";

contract BatchCallRootSystem is System {
  function batchCall(bytes32[] memory resourceSelectors, bytes[] memory callDatas) public {
    IBaseWorld world = IBaseWorld(_world());

    for (uint256 i; i < resourceSelectors.length; i++) {
      (bool success, bytes memory returnData) = address(world).delegatecall(
        abi.encodeCall(world.call, (resourceSelectors[i], callDatas[i]))
      );
      if (!success) revertWithBytes(returnData);
    }
  }
}
