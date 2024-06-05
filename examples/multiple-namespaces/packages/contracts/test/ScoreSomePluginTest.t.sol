// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { ResourceId, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Score } from "../src/codegen/somePlugin/tables/Score.sol";

contract ScoreSomePluginTest is MudTest {
  using WorldResourceIdInstance for ResourceId;

  function testScore(address player) public {
    IWorld(worldAddress).somePlugin__score(player);

    uint256 score = Score.get(player);
    assertEq(score, 1);
  }
}
