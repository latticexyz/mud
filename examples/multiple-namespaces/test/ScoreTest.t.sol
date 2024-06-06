// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Score } from "../src/codegen/somePlugin/tables/Score.sol";

address constant player = 0x44bDf8F1ada1D72c2CA157563b8deee97c0C8847;

contract ScoreTest is MudTest {
  function testScore() public {
    uint256 score = Score.get(player);
    assertEq(score, 0);

    vm.prank(player);
    IWorld(worldAddress).game__move(3, 2);
    vm.prank(player);
    vm.expectRevert("must be at goal");
    IWorld(worldAddress).somePlugin__increaseScore();

    score = Score.get(player);
    assertEq(score, 0);

    vm.prank(player);
    IWorld(worldAddress).game__move(4, 2);
    vm.prank(player);
    IWorld(worldAddress).somePlugin__increaseScore();

    score = Score.get(player);
    assertEq(score, 1);
  }
}
