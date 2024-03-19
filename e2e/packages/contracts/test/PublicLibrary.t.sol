// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";
import { LibWrapperSystemLib } from "../src/codegen/world/LibWrapperSystemLib.sol";

contract PublicLibraryTest is MudTest {
  /**
   * @dev Test that the deployer can handle deeply nested public libraries.
   */
  function testNesting() public {
    assertEq(IWorld(worldAddress).callLib(), "success");
    assertEq(IWorld(worldAddress).callFreeFunc(), "success");
  }

  function testLibNesting() public {
    assertEq(LibWrapperSystemLib.callLib(), "success");
    assertEq(LibWrapperSystemLib.callFreeFunc(), "success");
  }
}
