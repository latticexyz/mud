// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { Test } from "forge-std/Test.sol";
import { getAddressById } from "solecs/utils.sol";
import { SystemStorage } from "solecs/SystemStorage.sol";
import { console } from "forge-std/console.sol";
import { Utilities } from "./Utilities.sol";

interface IDeploy {
  function deploy(address deployer) external returns (IWorld world);
}

contract MudTest is Test {
  Utilities internal immutable utils = new Utilities();

  address payable internal alice;
  address payable internal bob;
  address payable internal eve;
  address internal deployer;

  IWorld internal world;
  IUint256Component components;
  IUint256Component systems;

  IDeploy internal deploy;

  constructor(IDeploy _deploy) {
    deploy = _deploy;
  }

  function component(uint256 id) public view returns (address) {
    return getAddressById(components, id);
  }

  function system(uint256 id) public view returns (address) {
    return getAddressById(systems, id);
  }

  modifier prank(address sender) {
    vm.startPrank(sender);
    _;
    vm.stopPrank();
  }

  function setUp() public virtual {
    deployer = msg.sender;
    world = deploy.deploy(deployer);

    components = world.components();
    systems = world.systems();
    alice = utils.getNextUserAddress();
    bob = utils.getNextUserAddress();
    eve = utils.getNextUserAddress();
    SystemStorage.init(world, components);
  }
}
