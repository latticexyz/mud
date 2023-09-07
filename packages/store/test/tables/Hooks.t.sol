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

    bytes21[] memory hooks = new bytes21[](1);
    hooks[0] = bytes21("some data");

    startGasReport("Hooks: set field (cold)");
    Hooks.set(key, hooks);
    endGasReport();

    startGasReport("Hooks: get field (warm)");
    bytes21[] memory returnedHooks = Hooks.get(key);
    endGasReport();

    assertEq(returnedHooks.length, hooks.length);
    assertEq(returnedHooks[0], hooks[0]);

    startGasReport("Hooks: push 1 element (cold)");
    Hooks.push(key, hooks[0]);
    endGasReport();

    returnedHooks = Hooks.get(key);

    assertEq(returnedHooks.length, 2);
    assertEq(returnedHooks[1], hooks[0]);

    startGasReport("Hooks: pop 1 element (warm)");
    Hooks.pop(key);
    endGasReport();

    returnedHooks = Hooks.get(key);

    assertEq(returnedHooks.length, 1);
    assertEq(returnedHooks[0], hooks[0]);

    startGasReport("Hooks: push 1 element (warm)");
    Hooks.push(key, hooks[0]);
    endGasReport();

    returnedHooks = Hooks.get(key);

    assertEq(returnedHooks.length, 2);
    assertEq(returnedHooks[1], hooks[0]);

    bytes21 newHook = bytes21(keccak256("alice"));
    startGasReport("Hooks: update 1 element (warm)");
    Hooks.update(key, 1, newHook);
    endGasReport();

    returnedHooks = Hooks.get(key);
    assertEq(returnedHooks.length, 2);
    assertEq(returnedHooks[0], hooks[0]);
    assertEq(returnedHooks[1], newHook);

    startGasReport("Hooks: delete record (warm)");
    Hooks.deleteRecord(key);
    endGasReport();

    returnedHooks = Hooks.get(key);
    assertEq(returnedHooks.length, 0);

    startGasReport("Hooks: set field (warm)");
    Hooks.set(key, hooks);
    endGasReport();
  }

  function testOneSlot() public {
    bytes32 key1 = keccak256("somekey");
    bytes21[] memory hooks = new bytes21[](1);
    hooks[0] = bytes21("some data");

    startGasReport("Hooks: set field with one elements (cold)");
    Hooks.set(key1, hooks);
    endGasReport();
  }

  function testTwoSlots() public {
    bytes32 key2 = keccak256("somekey");
    bytes21[] memory hooks = new bytes21[](2);
    hooks[0] = bytes21("some data");
    hooks[1] = bytes21("some other data");

    startGasReport("Hooks: set field with two elements (cold)");
    Hooks.set(key2, hooks);
    endGasReport();
  }

  function testThreeSlots() public {
    bytes32 key3 = keccak256("somekey");
    bytes21[] memory hooks = new bytes21[](3);
    hooks[0] = bytes21("some data");
    hooks[1] = bytes21("some other data");
    hooks[2] = bytes21("some other other data");

    startGasReport("Hooks: set field with three elements (cold)");
    Hooks.set(key3, hooks);
    endGasReport();
  }
}
