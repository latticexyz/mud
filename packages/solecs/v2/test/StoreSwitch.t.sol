// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { SchemaType } from "../Types.sol";
import { StoreCore } from "../StoreCore.sol";
import { StoreView } from "../StoreView.sol";
import { StoreSwitch } from "../StoreSwitch.sol";

// Mock contract implementing IStore without access control
contract Store is StoreView {
  System mockSystem = new System();

  function registerSchema(bytes32 table, SchemaType[] memory schema) public {
    StoreCore.registerSchema(table, schema);
  }

  function setData(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) public {
    StoreCore.setData(table, key, data);
  }

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
contract System {
  function isDelegateCall() public view returns (bool isDelegate) {
    uint256 gas = gasleft();
    isDelegate = StoreSwitch.isDelegateCall();
    gas = gas - gasleft();
    console.log("gas used: %s", gas);
  }
}

contract StoreSwitchTest is DSTestPlus {
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
