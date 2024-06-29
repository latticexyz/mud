// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";
import { Victory } from "../codegen/game/tables/Victory.sol";

contract game__VictorySystem is System {
  function win() public {
    Victory.set(true);
  }
}
