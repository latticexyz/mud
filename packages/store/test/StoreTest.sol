// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test, console } from "forge-std/Test.sol";

contract StoreTest is Test {
  string private __currentGasReportName;
  uint256 private __currentGasReportValue = gasleft();

  function startGasReport(string memory name) internal {
    __currentGasReportName = name;
    vm.pauseGasMetering();
    __currentGasReportValue = gasleft();
    vm.resumeGasMetering();
  }

  function endGasReport() internal view {
    uint256 gas = gasleft();
    uint256 gasUsed = __currentGasReportValue - gasleft();
    require(gasUsed > 0, "gas-report: gas used can't have a negative value, did you forget to call startGasReport?");
    console.log(string.concat("gas-report(", __currentGasReportName, "):", vm.toString(gasUsed)));
  }

  modifier gasReport(string memory name) {
    startGasReport(name);
    _;
    endGasReport();
  }
}
