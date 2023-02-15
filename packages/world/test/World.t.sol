// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { World } from "../src/World.sol";
import { System } from "../src/System.sol";

contract WorldTestSystem is System {
  function msgSender() public pure returns (address) {
    return _msgSender();
  }
}

contract WorldTest is Test {
  World internal world;
  WorldTestSystem internal system;

  function setUp() public {
    world = new World();
    system = new WorldTestSystem();
  }
}
