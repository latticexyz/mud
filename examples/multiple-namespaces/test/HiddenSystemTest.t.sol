// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Position, PositionData } from "../src/namespaces/game/codegen/tables/Position.sol";

contract HiddenSystemTest is MudTest {
  function testHide() public {
    vm.expectRevert();
    IWorld(worldAddress).game__hide();
  }
}
