// SPDX-License-Identifier: MIT
pragma solidity >=0.8.28;

import { System } from "@latticexyz/world/src/System.sol";
import { ASystemThing } from "../a/ASystemTypes.sol";
import { aSystem } from "../a/codegen/systems/ASystemLib.sol";

contract BSystem is System {
  function setValueInA(ASystemThing memory value) external {
    aSystem.setValue(value.a);
  }

  function getValueFromA() external view returns (uint256) {
    return aSystem.getValue();
  }
}
