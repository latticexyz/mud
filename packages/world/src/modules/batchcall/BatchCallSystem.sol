// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "../../System.sol";
import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";

contract BatchCallSystem is System {
  function batchCall(bytes32[] memory resourceSelectors, bytes[] memory funcSelectorAndArgss) public {
    IBaseWorld world = IBaseWorld(_world());

    for (uint256 i; i < resourceSelectors.length; i++) {
      world.callFrom(_msgSender(), resourceSelectors[i], funcSelectorAndArgss[i]);
    }
  }
}
