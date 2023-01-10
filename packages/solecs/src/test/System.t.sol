// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { DSTest } from "ds-test/test.sol";
import { World } from "../World.sol";
import { IUint256Component } from "../interfaces/IUint256Component.sol";
import { IWorld } from "../interfaces/IWorld.sol";
import { SystemStorage as s } from "../SystemStorage.sol";
import { System } from "../System.sol";

contract SampleSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {}

  function executeTyped() external returns (bytes memory) {
    return execute(abi.encode(""));
  }

  // Note: These two getter functions are necessary to access the vars of SampleSystem
  function getWorld() public view returns (IWorld) {
    return world;
  }

  function getComponents() public view returns (IUint256Component) {
    return components;
  }
}

contract SystemTest is DSTest {
  IUint256Component public systems;
  World internal world;
  IUint256Component public components;
  SampleSystem system;

  function setUp() public {
    world = new World();
    components = world.components();
    systems = world.systems();

    // Place world and component addresses in SystemTest's storage
    s.init(world, components);
    system = new SampleSystem(world, address(components));
  }

  // System has correct storage
  function testSystemStorage() public {
    assertEq(address(system.getWorld()), address(s.world()));
    assertEq(address(system.getComponents()), address(s.components()));
  }

  // SystemTest has correct storage
  function testSystemStorageTest() public {
    assertEq(address(world), address(s.world()));
    assertEq(address(components), address(s.components()));
  }
}
