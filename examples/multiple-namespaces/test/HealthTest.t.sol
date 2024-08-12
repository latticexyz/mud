// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "forge-std/Test.sol";
import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { Health } from "../src/namespaces/game/codegen/tables/Health.sol";

contract HealthTest is MudTest {
  function testHealth(address player) public {
    // Expect health to be 0 initially.
    uint32 health = Health.get(player);
    assertEq(health, 0);

    // Expect the counter to be 1 after healing.
    IWorld(worldAddress).game__heal(player);
    health = Health.get(player);
    assertEq(health, 1);
  }
}
