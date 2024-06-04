// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";
import { Score } from "../codegen/some-plugin/tables/Score.sol";

contract ScoreSystem is System {
  function score(address player) public {
    Score.set(player, Score.get(player) + 1);
  }
}
