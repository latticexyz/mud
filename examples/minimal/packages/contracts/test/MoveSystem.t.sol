// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { MudTest } from "@latticexyz/world/test/MudTest.t.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { IWorld } from "../src/codegen/world/IWorld.sol";

contract MoveSystemTest is MudTest, GasReporter {
  function testMove() public {
    startGasReport("moving");
    IWorld(worldAddress).move(1, 1);
    endGasReport();
  }
}
