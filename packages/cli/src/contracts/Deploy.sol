// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// Foundry
import {DSTest} from "ds-test/test.sol";
import {Vm} from "forge-std/Vm.sol";
import {console} from "forge-std/console.sol";
import {Cheats} from "./Cheats.sol";

// Libraries
import {LibDeploy, DeployResult} from "./LibDeploy.sol";

contract Deploy is DSTest {
  Cheats internal immutable vm = Cheats(HEVM_ADDRESS);

  function broadcastDeploy(
    address _deployer,
    address _world,
    bool _reuseComponents
  ) public returns (address world, uint256 initialBlockNumber) {
    vm.startBroadcast(_deployer);
    initialBlockNumber = block.number;
    DeployResult memory result = LibDeploy.deploy(_deployer, _world, _reuseComponents);
    vm.stopBroadcast();
    world = address(result.world);
  }
}
