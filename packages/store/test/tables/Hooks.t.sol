// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreView } from "../../src/StoreView.sol";
import { Hooks } from "../../src/tables/Hooks.sol";

contract HooksTest is Test, StoreView {
  function testSetAndGet() public {
    // Hooks schema is already registered by StoreCore
    bytes32 key = keccak256("somekey");

    address[] memory addresses = new address[](1);
    addresses[0] = address(this);

    // !gasreport set field in Hooks
    Hooks.set(key, addresses);

    // !gasreport get field from Hooks (warm)
    address[] memory returnedAddresses = Hooks.get(key);

    assertEq(returnedAddresses.length, addresses.length);
    assertEq(returnedAddresses[0], addresses[0]);

    // !gasreport push field to Hooks
    Hooks.push(key, addresses[0]);

    returnedAddresses = Hooks.get(key);

    assertEq(returnedAddresses.length, 2);
    assertEq(returnedAddresses[1], addresses[0]);
  }
}
