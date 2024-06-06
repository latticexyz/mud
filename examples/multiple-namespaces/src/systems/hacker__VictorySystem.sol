// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";
import { Victory } from "../codegen/game/tables/Victory.sol";

// This system has a different namespace, but is otherwise identical to game__VictorySystem
contract hacker__VictorySystem is System {
  function win() public {
    Victory.set(true);
  }
}
