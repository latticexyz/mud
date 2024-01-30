// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Position } from "../CustomTypes.sol";

error ThisErrorShouldBeAbsentFromTheGeneratedSystemInterface();

contract CustomErrorsSystem is System {
  error TestError1();
  error TestError2(Position position, uint256 value, string name, bool flag);

  function stub(uint256 arg) public pure returns (uint256) {
    return arg;
  }
}
