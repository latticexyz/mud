// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/std-contracts/src/test/GasReporter.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreConsumer } from "../src/StoreConsumer.sol";
import { StoreReadWithStubs } from "../src/StoreReadWithStubs.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";

// Mock Store and its consumer
contract StoreSwitchTestStore is StoreReadWithStubs {
  MockStoreConsumer mockConsumer = new MockStoreConsumer();

  function callViaDelegateCall() public returns (bool isDelegate) {
    (bool success, bytes memory data) = address(mockConsumer).delegatecall(abi.encodeWithSignature("isDelegateCall()"));
    if (!success) revert("delegatecall failed");
    isDelegate = abi.decode(data, (bool));
  }

  function callViaCall() public returns (bool isDelegate) {
    (bool success, bytes memory data) = address(mockConsumer).call(abi.encodeWithSignature("isDelegateCall()"));
    if (!success) revert("delegatecall failed");
    isDelegate = abi.decode(data, (bool));
  }
}

// Mock consumer to wrap StoreSwitch.isDelegateCall()
contract MockStoreConsumer is StoreConsumer, GasReporter {
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
