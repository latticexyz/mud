// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";
import { Position, PositionData } from "../codegen/index.sol";

function distance(PositionData memory a, PositionData memory b) pure returns (int32) {
  int32 deltaX = a.x > b.x ? a.x - b.x : b.x - a.x;
  int32 deltaY = a.y > b.y ? a.y - b.y : b.y - a.y;
  int32 deltaZ = a.z > b.z ? a.z - b.z : b.z - a.z;

  return deltaX + deltaY + deltaZ;
}

contract MoveSystem is System {
  function move(int32 x, int32 y, int32 z) public {
    bytes32 entityId = bytes32(uint256(uint160((_msgSender()))));

    PositionData memory position = Position.get(entityId);
    PositionData memory newPosition = PositionData(x, y, z);

    require(distance(position, newPosition) == 1, "can only move to adjacent spaces");

    Position.set(entityId, newPosition);
  }
}
