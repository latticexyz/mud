// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld, IMapSystem } from "../src/codegen/world/IWorld.sol";
import { Movable, Player, Position } from "../src/codegen/index.sol";
import { Direction } from "../src/codegen/common.sol";
import { addressToEntityKey } from "../src/utils.sol";

contract MapTest is MudTest {
  function testMap() public {
    IWorld world = IWorld(worldAddress);

    address player1 = address(0x01);
    bytes32 player1Entity = addressToEntityKey(player1);

    vm.startBroadcast(player1);

    // spawn player1
    world.spawn(3, 4);

    // expect player1's position to be x: 3 and y: 4
    (int32 x, int32 y) = Position.get(player1Entity);
    assertEq(x, 3);
    assertEq(y, 4);

    // expect player1 to be movable
    bool movable = Movable.get(player1Entity);
    assertEq(movable, true);

    // move player1 North (up)
    world.move(Direction.North);

    // expect player1's position to be x: 3 and y: 3
    (x, y) = Position.get(player1Entity);
    assertEq(x, 3);
    assertEq(y, 3);

    // should not be able to spawn the same player
    vm.expectRevert(IMapSystem.AlreadySpawned.selector);
    world.spawn(3, 4);

    vm.stopBroadcast();

    // should not be able to move a player that has not spawned yet
    address player2 = address(0x02);
    vm.startBroadcast(player2);

    vm.expectRevert(IMapSystem.CannotMove.selector);
    world.move(Direction.North);

    vm.stopBroadcast();
  }
}
