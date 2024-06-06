// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Position, PositionData } from "../src/codegen/game/tables/Position.sol";

address constant player = 0x44bDf8F1ada1D72c2CA157563b8deee97c0C8847;

contract PositionTest is MudTest {
  function testPosition(int32 x, int32 y) public {
    vm.prank(player);
    IWorld(worldAddress).game__move(x, y);

    PositionData memory position = Position.get(player);
    assertEq(position.x, x);
    assertEq(position.y, y);
  }
}
