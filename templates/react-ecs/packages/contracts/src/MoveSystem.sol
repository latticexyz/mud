// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

import { Direction } from "./codegen/common.sol";
import { Owner } from "./codegen/tables/Owner.sol";
import { Position, PositionData } from "./codegen/tables/Position.sol";
import { Entity } from "./Entity.sol";

contract MoveSystem is System {
  function move(Entity entity, Direction direction) public {
    address owner = Owner.get(entity);
    require(owner == _msgSender(), "You cannot move this entity.");

    PositionData memory position = Position.get(entity);

    if (direction == Direction.North) {
      position.y += 1;
    } else if (direction == Direction.East) {
      position.x += 1;
    } else if (direction == Direction.South) {
      position.y -= 1;
    } else if (direction == Direction.West) {
      position.x -= 1;
    }

    Position.set(entity, position);
  }
}
