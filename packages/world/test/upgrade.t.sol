// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { World } from "../src/World.sol";

import { Upgrades } from "openzeppelin-foundry-upgrades/Upgrades.sol";

contract UpgradeTest is Test, GasReporter {
  function testUpgrade() public {
    uint256 one = 1;
    assertEq(one, 1);

    address proxy = Upgrades.deployUUPSProxy("World.sol", abi.encodeCall(World.initialize, ()));
  }
}
