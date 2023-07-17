// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";

// Mock Store and its consumer
contract StoreSwitchTestStore is StoreReadWithStubs {
  MockSystem mockSystem = new MockSystem();

  function callViaDelegateCall() public returns (address storeAddress) {
    (bool success, bytes memory data) = address(mockSystem).delegatecall(abi.encodeWithSignature("getStoreAddress()"));
    if (!success) revert("delegatecall failed");
    storeAddress = abi.decode(data, (address));
  }

  function callViaCall() public returns (address storeAddress) {
    (bool success, bytes memory data) = address(mockSystem).call(abi.encodeWithSignature("getStoreAddress()"));
    if (!success) revert("delegatecall failed");
    storeAddress = abi.decode(data, (address));
  }
}

// Mock system to wrap StoreSwitch.getStoreAddress()
contract MockSystem is GasReporter {
  function getStoreAddress() public returns (address storeAddress) {
    startGasReport("get Store address");
    storeAddress = StoreSwitch.getStoreAddress();
    endGasReport();
  }
}

contract StoreSwitchTest is Test, GasReporter {
  StoreSwitchTestStore store;

  function setUp() public {
    store = new StoreSwitchTestStore();
  }

  function testDelegatecall() public {
    address storeAddress = store.callViaDelegateCall();
    assertEq(storeAddress, address(store));
  }

  function testNoDelegatecall() public {
    address storeAddress = store.callViaCall();
    assertEq(storeAddress, address(store));
  }

  // TODO: tests for setting data on self vs msg.sender
}
