// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Position, PositionData } from "../src/codegen/gameFork/tables/Position.sol";

contract GameForkPositionTest is MudTest {
  function testCounter(address player) public {
    PositionData memory position = Position.get(player);
    assertEq(position.x, 0);
    assertEq(position.y, 0);
  }
}
