// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { IWorldErrors } from "@latticexyz/world/src/IWorldErrors.sol";
import { ResourceId, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Victory } from "../src/codegen/game/tables/Victory.sol";

contract VictoryTest is MudTest {
  using WorldResourceIdInstance for ResourceId;

  function testScoreGame() public {
    IWorld(worldAddress).game__win();

    assertTrue(Victory.get());
  }

  function testScoreHacker() public {
    // The system call fails because it attempts to modify a table in a different namespace
    vm.expectRevert(
      abi.encodeWithSelector(
        IWorldErrors.World_AccessDenied.selector,
        Victory._tableId.toString(),
        0x266c3370ad8C238819899f47Eaee7289e4C51AC8
      )
    );
    IWorld(worldAddress).hacker__win();
  }
}
