// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Deploy } from "./Deploy.sol";
import "std-contracts/test/MudTest.t.sol";

contract DeployTest is MudTest {
  constructor() MudTest(new Deploy()) {}

  function testDeploy() public view {
    console.log("Deployer");
    console.log(deployer);
  }
}
