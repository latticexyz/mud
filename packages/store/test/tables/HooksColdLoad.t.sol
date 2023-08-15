// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreReadWithStubs } from "../../src/StoreReadWithStubs.sol";
import { Hooks } from "../../src/codegen/Tables.sol";

contract HooksColdLoadTest is Test, GasReporter, StoreReadWithStubs {
  address[] addresses;

  function setUp() public {
    // Hooks schema is already registered by StoreCore
    bytes32 key = keccak256("somekey");

    addresses = new address[](1);
    addresses[0] = address(this);

    Hooks.set(key, addresses);
  }

  function testGet() public {
    bytes32 key = keccak256("somekey");

    startGasReport("Hooks: get field (cold)");
    address[] memory returnedAddresses = Hooks.get(key);
    endGasReport();

    assertEq(returnedAddresses.length, addresses.length);
    assertEq(returnedAddresses[0], addresses[0]);
  }

  function testLength() public {
    bytes32 key = keccak256("somekey");

    startGasReport("Hooks: get length (cold)");
    uint256 length = Hooks.length(key);
    endGasReport();

    assertEq(length, addresses.length);
  }

  function testGetItem() public {
    bytes32 key = keccak256("somekey");

    startGasReport("Hooks: get 1 element (cold)");
    address returnedAddress = Hooks.getItem(key, 0);
    endGasReport();

    assertEq(returnedAddress, addresses[0]);
  }

  function testPop() public {
    bytes32 key = keccak256("somekey");

    startGasReport("Hooks: pop 1 element (cold)");
    Hooks.pop(key);
    endGasReport();

    uint256 length = Hooks.length(key);

    assertEq(length, addresses.length - 1);
  }

  function testUpdate() public {
    bytes32 key = keccak256("somekey");

    address newAddress = address(bytes20(keccak256("alice")));
    startGasReport("Hooks: update 1 element (cold)");
    Hooks.update(key, 0, newAddress);
    endGasReport();

    address[] memory returnedAddresses = Hooks.get(key);
    assertEq(returnedAddresses.length, 1);
    assertEq(returnedAddresses[0], newAddress);
  }

  function testDelete() public {
    bytes32 key = keccak256("somekey");

    startGasReport("Hooks: delete record (cold)");
    Hooks.deleteRecord(key);
    endGasReport();

    address[] memory returnedAddresses = Hooks.get(key);
    assertEq(returnedAddresses.length, 0);
  }
}
