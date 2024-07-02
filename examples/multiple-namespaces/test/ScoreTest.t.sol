// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Score } from "../src/namespaces/scoreboard/codegen/tables/Score.sol";

address constant alice = address(1);

contract ScoreTest is MudTest {
  function testScore() public {
    uint256 score = Score.get(alice);
    assertEq(score, 0);

    vm.prank(alice);
    IWorld(worldAddress).game__move(3, 2);
    vm.prank(alice);
    vm.expectRevert("must be at goal");
    IWorld(worldAddress).scoreboard__increaseScore();

    score = Score.get(alice);
    assertEq(score, 0);

    vm.prank(alice);
    IWorld(worldAddress).game__move(4, 2);
    vm.prank(alice);
    IWorld(worldAddress).scoreboard__increaseScore();

    score = Score.get(alice);
    assertEq(score, 1);
  }
}
