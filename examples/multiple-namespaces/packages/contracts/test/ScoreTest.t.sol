// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { ResourceId, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Score } from "../src/codegen/some-plugin/tables/Score.sol";

contract ScoreTest is MudTest {
  using WorldResourceIdInstance for ResourceId;

  function testScore(address player) public {
    // The system call fails because it attempts to modify a table in a different namespace
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.World_AccessDenied.selector,
        Score._tableId.toString(),
        0xb02f49Cccf3e20302446FD8124d27c3f70AeC7C9
      )
    );
    IWorld(worldAddress).game__score(player);
  }
}
