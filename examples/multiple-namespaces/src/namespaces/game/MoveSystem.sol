// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { System } from "@latticexyz/world/src/System.sol";
import { Position } from "./codegen/tables/Position.sol";

contract MoveSystem is System {
  function move(address player, int32 x, int32 y) public {
    Position.set(player, x, y);
  }
}
