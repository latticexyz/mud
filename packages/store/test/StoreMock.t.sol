// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { STORE_VERSION } from "../src/version.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreMock } from "../test/StoreMock.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";
import { IStoreEvents } from "../src/IStoreEvents.sol";
import { Initializable } from "../src/Initializable.sol";

contract StoreMockTest is Test {
  function testStoreMockInitialize() public {
    vm.expectEmit(true, true, true, true);
    emit IStoreEvents.HelloStore(STORE_VERSION);
    new StoreMock();
  }
}
