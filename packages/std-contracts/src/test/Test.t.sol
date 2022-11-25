// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

// External
import { DSTest } from "ds-test/test.sol";
import "forge-std/Test.sol";
import { Vm } from "forge-std/Vm.sol";
import { World } from "solecs/World.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { componentsComponentId, systemsComponentId } from "solecs/constants.sol";
import { getAddressById, getComponentById } from "solecs/utils.sol";
import { console } from "forge-std/console.sol";
import { addressToEntity } from "solecs/utils.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { LibStorage as s, MUD_WORLD, MUD_COMPONENTS } from "../libraries/LibStorage.sol";

contract MudTest is DSTest {
  IUint256Component public systems; // Not storage slot 0
  World internal world; // Storage slot 1
  IUint256Component public components; // Storage slot 2

  Vm internal immutable vm = Vm(HEVM_ADDRESS);

  address payable internal alice;
  address payable internal bob;
  address payable internal eve;
  address internal deployer;

  modifier prank(address sender) {
    vm.startPrank(sender);
    _;
    vm.stopPrank();
  }

  function component(uint256 id) public view returns (address) {
    return getAddressById(components, id);
  }

  function system(uint256 id) public view returns (address) {
    return getAddressById(systems, id);
  }

  function setUp() public {
    uint256 gas = gasleft();
    // deployer = utils.getNextUserAddress();
    world = new World();
    components = world.components();
    systems = world.systems();
    // deployer = deploy.deployer();
    // alice = utils.getNextUserAddress();
    // bob = utils.getNextUserAddress();
    // eve = utils.getNextUserAddress();
    console.log("setup used %s gas", gas - gasleft());
    s.set(MUD_WORLD, bytes32(uint256(uint160(address(world)))));
    s.set(MUD_COMPONENTS, bytes32(uint256(uint160(address(components)))));
  }

  function testStorage() public {
    // Testing storage!
    console.log("real world", address(world));
    console.log("lib s world", address(s.w()));
    console.log("real comp", address(components));
    console.log("lib comp", address(s.c()));
  }
}
