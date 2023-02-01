// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { SchemaType } from "../src/Types.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { StoreView } from "../src/StoreView.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";

// Mock Store to call MockSystem
contract Store is StoreView {
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
contract MockSystem {
  function isDelegateCall() public view returns (bool isDelegate) {
    // !gasreport check if delegatecall
    isDelegate = StoreSwitch.isDelegateCall();
  }
}

contract StoreSwitchTest is Test {
  Store store;

  function setUp() public {
    store = new Store();
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
