// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { DSTest } from "ds-test/test.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { Vm } from "forge-std/Vm.sol";
import { getAddressById } from "solecs/utils.sol";
import { console } from "forge-std/console.sol";
import { Utilities } from "./Utilities.sol";

interface IDeploy {
  function deploy(address deployer) external returns (IWorld world);
}

contract MudTest is DSTest {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);
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

  function setUp() public {
    deployer = utils.getNextUserAddress();
    world = deploy.deploy(deployer);

    components = world.components();
    systems = world.systems();
    alice = utils.getNextUserAddress();
    bob = utils.getNextUserAddress();
    eve = utils.getNextUserAddress();
  }
}
