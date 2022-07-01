// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

// Foundry
import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";
import { Utilities } from "./Utilities.sol";
import { Cheats } from "./Cheats.sol";

// Libs
import { LibDeploy, DeployResult } from "../../libraries/LibDeploy.sol";

contract Deploy is DSTest {
  Cheats internal immutable vm = Cheats(HEVM_ADDRESS);

  function deployEmber(
    address _deployer,
    address _personaMirror,
    address payable _diamond,
    address _world,
    bool _reuseComponents
  )
    public
    returns (
      address personaMirror,
      address diamond,
      address world
    )
  {
    vm.startBroadcast(_deployer);
    DeployResult memory result = LibDeploy.deploy(_deployer, _personaMirror, _diamond, _world, _reuseComponents);
    vm.stopBroadcast();
    personaMirror = address(result.personaMirror);
    diamond = address(result.diamond);
    world = address(result.world);
  }
}
