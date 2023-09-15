// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { STORE_VERSION } from "../src/constants.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreMock } from "../test/StoreMock.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";

contract StoreMockTest is Test {
  event HelloStore(bytes32 indexed storeVersion);

  function testStoreMockConstrctor() public {
    vm.expectEmit(true, true, true, true);
    emit HelloStore(STORE_VERSION);
    new StoreMock();
  }
}
