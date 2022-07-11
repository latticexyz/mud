// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { DSTest } from "ds-test/test.sol";
import { Utilities } from "./utils/Utilities.sol";
import { Deploy } from "./utils/Deploy.sol";
import { Cheats } from "./utils/Cheats.sol";

contract DeployTest is DSTest {
  Deploy internal deploy = new Deploy();

  function testDeploy() public {
    deploy.deploy(address(0), address(0), false);
  }
}
