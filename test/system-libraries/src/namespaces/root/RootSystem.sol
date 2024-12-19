// SPDX-License-Identifier: MIT
pragma solidity >=0.8.28;

import { System } from "@latticexyz/world/src/System.sol";
import { aSystem } from "../a/codegen/systems/ASystemLib.sol";
import { ASystemThing } from "../a/ASystemTypes.sol";

contract RootSystem is System {
  function setValueInA(ASystemThing memory thing) external {
    aSystem.callAsRoot().setValue(thing);
  }

  function getValueFromA() external view returns (uint256) {
    return aSystem.callAsRoot().getValue();
  }
}
