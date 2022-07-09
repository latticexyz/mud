// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

// Foundry
import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";
import { Utilities } from "./Utilities.sol";
import { Cheats } from "./Cheats.sol";

// Libraries
import { LibDeploy, DeployResult } from "../../libraries/LibDeploy.sol";

contract Deploy is DSTest {
  Cheats internal immutable vm = Cheats(HEVM_ADDRESS);

  function deploy(
    address _deployer,
    address _world,
    bool _reuseComponents
  ) public returns (address world) {
    vm.startBroadcast(_deployer);
    DeployResult memory result = LibDeploy.deploy(_deployer, _world, _reuseComponents);
    vm.stopBroadcast();
    world = address(result.world);
  }
}
