// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "../src/test/GasReporter.sol";

contract GasReporterTest is Test, GasReporter {
  function testGasReporterGas() public {
    startGasReport("empty gas report");
    endGasReport();
    // An empty gas report should always result in zero gas. If not, update GasReporter's gasUsed calculation to make this zero.
    assertEq(getGasUsed("empty gas report"), 0);
  }
}
