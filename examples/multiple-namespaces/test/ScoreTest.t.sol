// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { ResourceId, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Score } from "../src/codegen/game/tables/Score.sol";

contract ScoreTest is MudTest {
  using WorldResourceIdInstance for ResourceId;

  function testScoreGame(address player) public {
    IWorld(worldAddress).game__score(player);

    uint256 score = Score.get(player);
    assertEq(score, 1);
  }

  function testScoreHacker(address player) public {
    // The system call fails because it attempts to modify a table in a different namespace
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.World_AccessDenied.selector,
        Score._tableId.toString(),
        0x737Df845247EDb7934702753c329bcB5984B8950
      )
    );
    IWorld(worldAddress).hacker__score(player);
  }
}
