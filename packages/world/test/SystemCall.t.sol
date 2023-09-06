// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";

import { SystemCall } from "../src/SystemCall.sol";

contract SystemCallTest is Test, GasReporter {
  event SystemCallStart(bytes32 resourceSelector, bytes funcSelectorAndArgs);

  function testGasSystemCallEvent() public {
    bytes32 resourceSelector = "resource";
    bytes memory funcSelectorAndArgs = abi.encodeWithSignature("someFunction()", 1, 2, 3);

    startGasReport("emit a system call event");
    emit SystemCallStart(resourceSelector, funcSelectorAndArgs);
    endGasReport();
  }
}
