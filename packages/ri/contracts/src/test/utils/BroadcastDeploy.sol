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
    address payable _diamond
  ) public returns (address) {
    vm.startBroadcast(_deployer);
    DeployResult memory result = LibDeploy.deploy(_deployer, _personaMirror, _diamond);
    vm.stopBroadcast();
    return address(result.diamond);
  }
}
