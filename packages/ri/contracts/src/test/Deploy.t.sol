// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";
import { World } from "solecs/World.sol";
import { Utilities } from "./utils/Utilities.sol";
import { Deploy } from "./utils/Deploy.sol";

contract DeployTest is DSTest {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);
  Utilities internal immutable utils = new Utilities();

  Deploy internal deploy = new Deploy();

  function testDeploy() public {
    deploy.deployEmber();
  }

  function testDeployAndSetupFixtures() public {
    deploy.deployEmber();
    deploy.deployTestFixtures();
  }
}
