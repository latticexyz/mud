// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test, console } from "forge-std/Test.sol";

contract GasReporter is Test {
  string private __currentGasReportName;
  uint256 private __currentGasReportValue = gasleft();
  mapping(string => uint256) private __gasReports;
  string[] private __gasReportNames;

  function startGasReport(string memory name) internal {
    if (!vm.envOr("GAS_REPORTER_ENABLED", false)) return;
    require(
      bytes(__currentGasReportName).length == 0,
      string.concat(
        'gas report "',
        __currentGasReportName,
        '" is already running and only one report can be run at a time'
      )
    );
    require(__gasReports[name] == 0, string.concat('gas report "', name, '" already used for this test'));
    __currentGasReportName = name;
    vm.pauseGasMetering();
    __currentGasReportValue = gasleft();
    vm.resumeGasMetering();
  }

  function endGasReport() internal {
    uint256 gas = gasleft();
    if (!vm.envOr("GAS_REPORTER_ENABLED", false)) return;
    // subtract 160 gas used by the GasReporter itself
    // add 1 gas so we can later check that this is set
    uint256 gasUsed = __currentGasReportValue - gas - 160 + 1;
    require(gasUsed > 0, "gas report didn't use gas");
    __gasReports[__currentGasReportName] = gasUsed;
    __gasReportNames.push(__currentGasReportName);
    printGasReport(__currentGasReportName);
    __currentGasReportName = "";
  }

  modifier gasReport(string memory name) {
    startGasReport(name);
    _;
    endGasReport();
  }

  function getGasUsed(string memory name) internal view returns (uint256) {
    require(__gasReports[name] > 0, string.concat('gas report "', name, '" not found'));
    return __gasReports[name];
  }

  function printGasReport(string memory name) internal view {
    console.log(string.concat("GAS REPORT: ", vm.toString(__gasReports[name]), " ", name));
  }

  function printGasReports() internal view {
    for (uint256 i = 0; i < __gasReportNames.length; i++) {
      printGasReport(__gasReportNames[i]);
    }
  }
}
