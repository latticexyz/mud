// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Position, PositionData } from "../src/codegen/tables/Position.sol";
import { Direction } from "../src/codegen/common.sol";

contract MoveTest is MudTest {
  function testMove() public {
    address alice = vm.addr(uint256(keccak256("alice")));
    vm.startPrank(alice);

    PositionData memory position = Position.get(alice);
    assertEq(position.x, 0);
    assertEq(position.y, 0);

    IWorld(worldAddress).app__move(Direction.North);
    position = Position.get(alice);
    assertEq(position.x, 0);
    assertEq(position.y, 1);
  }
}
