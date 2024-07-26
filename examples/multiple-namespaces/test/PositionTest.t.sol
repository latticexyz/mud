// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Position, PositionData } from "../src/namespaces/game/codegen/tables/Position.sol";

contract PositionTest is MudTest {
  function testPosition(address player, int32 x, int32 y) public {
    IWorld(worldAddress).game__move(player, x, y);
    PositionData memory position = Position.get(player);
    assertEq(position.x, x);
    assertEq(position.y, y);
  }
}
