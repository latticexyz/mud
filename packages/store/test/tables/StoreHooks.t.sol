// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { StoreMock } from "../../test/StoreMock.sol";
import { StoreHooks } from "../../src/codegen/Tables.sol";

contract StoreHooksTest is Test, GasReporter, StoreMock {
  function testTable() public {
    // StoreHooks table is already registered by StoreMock
    bytes32 key = keccak256("somekey");

    bytes21[] memory hooks = new bytes21[](1);
    hooks[0] = bytes21("some data");

    startGasReport("StoreHooks: set field (cold)");
    StoreHooks.set(key, hooks);
    endGasReport();

    startGasReport("StoreHooks: get field (warm)");
    bytes21[] memory returnedHooks = StoreHooks.get(key);
    endGasReport();

    assertEq(returnedHooks.length, hooks.length);
    assertEq(returnedHooks[0], hooks[0]);

    startGasReport("StoreHooks: push 1 element (cold)");
    StoreHooks.push(key, hooks[0]);
    endGasReport();

    returnedHooks = StoreHooks.get(key);

    assertEq(returnedHooks.length, 2);
    assertEq(returnedHooks[1], hooks[0]);

    startGasReport("StoreHooks: pop 1 element (warm)");
    StoreHooks.pop(key);
    endGasReport();

    returnedHooks = StoreHooks.get(key);

    assertEq(returnedHooks.length, 1);
    assertEq(returnedHooks[0], hooks[0]);

    startGasReport("StoreHooks: push 1 element (warm)");
    StoreHooks.push(key, hooks[0]);
    endGasReport();

    returnedHooks = StoreHooks.get(key);

    assertEq(returnedHooks.length, 2);
    assertEq(returnedHooks[1], hooks[0]);

    bytes21 newHook = bytes21(keccak256("alice"));
    startGasReport("StoreHooks: update 1 element (warm)");
    StoreHooks.update(key, 1, newHook);
    endGasReport();

    returnedHooks = StoreHooks.get(key);
    assertEq(returnedHooks.length, 2);
    assertEq(returnedHooks[0], hooks[0]);
    assertEq(returnedHooks[1], newHook);

    startGasReport("StoreHooks: delete record (warm)");
    StoreHooks.deleteRecord(key);
    endGasReport();

    returnedHooks = StoreHooks.get(key);
    assertEq(returnedHooks.length, 0);

    startGasReport("StoreHooks: set field (warm)");
    StoreHooks.set(key, hooks);
    endGasReport();
  }

  function testOneSlot() public {
    bytes32 key1 = keccak256("somekey");
    bytes21[] memory hooks = new bytes21[](1);
    hooks[0] = bytes21("some data");

    startGasReport("StoreHooks: set field with one elements (cold)");
    StoreHooks.set(key1, hooks);
    endGasReport();
  }

  function testTwoSlots() public {
    bytes32 key2 = keccak256("somekey");
    bytes21[] memory hooks = new bytes21[](2);
    hooks[0] = bytes21("some data");
    hooks[1] = bytes21("some other data");

    startGasReport("StoreHooks: set field with two elements (cold)");
    StoreHooks.set(key2, hooks);
    endGasReport();
  }

  function testThreeSlots() public {
    bytes32 key3 = keccak256("somekey");
    bytes21[] memory hooks = new bytes21[](3);
    hooks[0] = bytes21("some data");
    hooks[1] = bytes21("some other data");
    hooks[2] = bytes21("some other other data");

    startGasReport("StoreHooks: set field with three elements (cold)");
    StoreHooks.set(key3, hooks);
    endGasReport();
  }
}
