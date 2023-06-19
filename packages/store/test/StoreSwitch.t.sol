// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/std-contracts/src/test/GasReporter.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";

// Mock Store to call MockSystem
contract StoreSwitchTestStore is StoreReadWithStubs {
  MockSystem mockSystem = new MockSystem();

  function callViaDelegateCall() public returns (bool isDelegate) {
    (bool success, bytes memory data) = address(mockSystem).delegatecall(abi.encodeWithSignature("isDelegateCall()"));
    if (!success) revert("delegatecall failed");
    isDelegate = abi.decode(data, (bool));
  }

  function callViaCall() public returns (bool isDelegate) {
    (bool success, bytes memory data) = address(mockSystem).call(abi.encodeWithSignature("isDelegateCall()"));
    if (!success) revert("delegatecall failed");
    isDelegate = abi.decode(data, (bool));
  }
}

// Mock system to wrap StoreSwitch.isDelegateCall()
contract MockSystem is GasReporter {
  function isDelegateCall() public returns (bool isDelegate) {
    startGasReport("check if delegatecall");
    isDelegate = StoreSwitch.isDelegateCall();
    endGasReport();
  }
}

contract StoreSwitchTest is Test, GasReporter {
  StoreSwitchTestStore store;

  function setUp() public {
    store = new StoreSwitchTestStore();
  }

  function testIsDelegatecall() public {
    bool isDelegate = store.callViaDelegateCall();
    assertTrue(isDelegate);
  }

  function testIsNoDelegatecall() public {
    bool isDelegate = store.callViaCall();
    assertFalse(isDelegate);
  }

  // TODO: tests for setting data on self vs msg.sender
}
