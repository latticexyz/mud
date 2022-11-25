// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

// External
import { DSTest } from "ds-test/test.sol";
import { World } from "solecs/World.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { console } from "forge-std/console.sol";
import { LibStorage as s, worldID, componentsID } from "../libraries/LibStorage.sol";

contract MudTest is DSTest {
  IUint256Component public systems; // Not storage slot 0
  World internal world; // Storage slot 1
  IUint256Component public components; // Storage slot 2

  function setUp() public {
    world = new World();
    components = world.components();
    systems = world.systems();
    s.storeAddress(worldID, address(world));
    s.storeAddress(componentsID, address(components));
  }

  function testStorage() public {
    assertEq(address(world), address(s.w()));
    assertEq(address(components), address(s.c()));
  }
}
