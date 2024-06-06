// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";

import { Position, PositionData } from "../codegen/game/tables/Position.sol";
import { Victory } from "../codegen/somePlugin/tables/Victory.sol";

int32 constant goalX = 4;
int32 constant goalY = 2;

contract somePlugin__VictorySystem is System {
  function increaseVictory() public {
    address player = _msgSender();

    PositionData memory position = Position.get(player);
    require(position.x == goalX && position.y == goalY, "must be at goal");

    Victory.set(true);
  }
}
