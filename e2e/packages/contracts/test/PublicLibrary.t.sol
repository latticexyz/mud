// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

contract PublicLibraryTest is MudTest {
  // Test that the deployer can handle deeply nested public libraries
  function testNesting() public {
    assertEq(IWorld(worldAddress).callLib(), "success");
  }
}
