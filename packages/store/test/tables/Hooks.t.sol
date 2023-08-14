// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreReadWithStubs } from "../../src/StoreReadWithStubs.sol";
import { Hooks } from "../../src/codegen/Tables.sol";

contract HooksTest is Test, GasReporter, StoreReadWithStubs {
  function testTable() public {
    // Hooks schema is already registered by StoreCore
    bytes32 key = keccak256("somekey");

    address[] memory addresses = new address[](1);
    addresses[0] = address(this);

    startGasReport("Hooks: set field (cold)");
    Hooks.set(key, addresses);
    endGasReport();

    startGasReport("Hooks: get field (warm)");
    address[] memory returnedAddresses = Hooks.get(key);
    endGasReport();

    assertEq(returnedAddresses.length, addresses.length);
    assertEq(returnedAddresses[0], addresses[0]);

    startGasReport("Hooks: push 1 element (cold)");
    Hooks.push(key, addresses[0]);
    endGasReport();

    returnedAddresses = Hooks.get(key);

    assertEq(returnedAddresses.length, 2);
    assertEq(returnedAddresses[1], addresses[0]);

    startGasReport("Hooks: pop 1 element (warm)");
    Hooks.pop(key);
    endGasReport();

    returnedAddresses = Hooks.get(key);

    assertEq(returnedAddresses.length, 1);
    assertEq(returnedAddresses[0], addresses[0]);

    startGasReport("Hooks: push 1 element (warm)");
    Hooks.push(key, addresses[0]);
    endGasReport();

    returnedAddresses = Hooks.get(key);

    assertEq(returnedAddresses.length, 2);
    assertEq(returnedAddresses[1], addresses[0]);

    address newAddress = address(bytes20(keccak256("alice")));
    startGasReport("Hooks: update 1 element (warm)");
    Hooks.update(key, 1, newAddress);
    endGasReport();

    returnedAddresses = Hooks.get(key);
    assertEq(returnedAddresses.length, 2);
    assertEq(returnedAddresses[0], addresses[0]);
    assertEq(returnedAddresses[1], newAddress);

    startGasReport("Hooks: delete record (warm)");
    Hooks.deleteRecord(key);
    endGasReport();

    returnedAddresses = Hooks.get(key);
    assertEq(returnedAddresses.length, 0);

    startGasReport("Hooks: set field (warm)");
    Hooks.set(key, addresses);
    endGasReport();
  }
}
