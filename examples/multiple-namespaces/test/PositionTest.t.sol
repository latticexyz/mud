// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Position, PositionData } from "../src/namespaces/game/codegen/tables/Position.sol";

address constant alice = address(1);

contract PositionTest is MudTest {
  function testPosition(int32 x, int32 y) public {
    vm.prank(alice);
    IWorld(worldAddress).game__move(x, y);

    PositionData memory position = Position.get(alice);
    assertEq(position.x, x);
    assertEq(position.y, y);
  }
}
