// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/gas-report/src/GasReporter.sol";
import { Callbacks } from "./codegen/tables/Callbacks.sol";
import { StoreMock } from "./StoreMock.sol";

contract CallbacksTest is Test, GasReporter, StoreMock {
  function testSetAndGet() public {
    Callbacks.register();
    bytes32 key = keccak256("somekey");

    bytes24[] memory callbacks = new bytes24[](1);
    callbacks[0] = bytes24(abi.encode(this.testSetAndGet));

    startGasReport("Callbacks: set field");
    Callbacks.set(key, callbacks);
    endGasReport();

    startGasReport("Callbacks: get field (warm)");
    bytes24[] memory returnedCallbacks = Callbacks.get(key);
    endGasReport();

    assertEq(returnedCallbacks.length, callbacks.length);
    assertEq(returnedCallbacks[0], callbacks[0]);

    startGasReport("Callbacks: push 1 element");
    Callbacks.push(key, callbacks[0]);
    endGasReport();

    returnedCallbacks = Callbacks.get(key);

    assertEq(returnedCallbacks.length, 2);
    assertEq(returnedCallbacks[1], callbacks[0]);
  }
}
