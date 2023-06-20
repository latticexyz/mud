// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "../src/test/GasReporter.sol";

contract GasReporterTest is Test, GasReporter {
  function testGasReporterGas() public {
    vm.setEnv("GAS_REPORTER_ENABLED", "true");
    startGasReport("empty gas report");
    endGasReport();
    // An "empty" gas report should be 1 gas. If not, update GasReporter's gasUsed calculation.
    assertEq(getGasUsed("empty gas report"), 1);
  }
}
