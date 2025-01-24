// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Owner } from "../src/codegen/tables/Owner.sol";
import { Position, PositionData } from "../src/codegen/tables/Position.sol";
import { Direction } from "../src/codegen/common.sol";
import { Entity } from "../src/Entity.sol";

contract MoveTest is MudTest {
  uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
  address deployer = vm.addr(deployerPrivateKey);

  address alice = vm.addr(uint256(keccak256("alice")));
  address bob = vm.addr(uint256(keccak256("bob")));

  function testMove() public {
    Entity entity = Entity.wrap(keccak256("entity"));
    vm.prank(deployer);
    Owner.set(entity, alice);

    PositionData memory position = Position.get(entity);
    assertEq(position.x, 0);
    assertEq(position.y, 0);

    vm.prank(alice);
    IWorld(worldAddress).app__move(entity, Direction.North);
    position = Position.get(entity);
    assertEq(position.x, 0);
    assertEq(position.y, 1);

    vm.prank(bob);
    vm.expectRevert("You cannot move this entity.");
    IWorld(worldAddress).app__move(entity, Direction.North);
  }
}
