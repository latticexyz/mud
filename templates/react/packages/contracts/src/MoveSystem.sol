// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

import { Direction } from "./codegen/common.sol";
import { Position, PositionData } from "./codegen/tables/Position.sol";

contract MoveSystem is System {
  function move(Direction direction) public {
    address player = _msgSender();
    PositionData memory position = Position.get(player);

    if (direction == Direction.North) {
      position.y += 1;
    } else if (direction == Direction.East) {
      position.x += 1;
    } else if (direction == Direction.South) {
      position.y -= 1;
    } else if (direction == Direction.West) {
      position.x -= 1;
    }

    Position.set(player, position);
  }
}
