// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { Position } from "../CustomTypes.sol";

contract CustomEventsSystem is System {
  event TestEvent1();
  error TestEvent2(Position position, uint256 value, string name, bool flag);

  function stub2(uint256 arg) public pure returns (uint256) {
    return arg;
  }
}
