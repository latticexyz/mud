// SPDX-License-Identifier: MIT
pragma solidity >=0.8.28;

import { System } from "@latticexyz/world/src/System.sol";
import { aSystem } from "../a/codegen/libraries/ASystemLib.sol";

contract RootSystem is System {
  function setValueInA(uint256 value) external {
    aSystem.callAsRoot().setValue(value);
  }
}
