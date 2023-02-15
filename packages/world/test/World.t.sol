// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { World } from "../src/World.sol";

contract WorldTest is Test {
  World world;

  function setUp() public {
    world = new World();
  }

  function testIsStore() public view {
    world.isStore();
  }
}
