// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { GasReporter } from "@latticexyz/std-contracts/src/test/GasReporter.sol";
import { StoreReadWithStubs } from "../../src/StoreReadWithStubs.sol";
import { Callbacks } from "../../src/codegen/Tables.sol";

contract CallbacksTest is Test, GasReporter, StoreReadWithStubs {
  function testSetAndGet() public {
    Callbacks.registerSchema();
    bytes32 key = keccak256("somekey");

    bytes24[] memory callbacks = new bytes24[](1);
    callbacks[0] = bytes24(abi.encode(this.testSetAndGet));

    startGasReport("set field in Callbacks");
    Callbacks.set(key, callbacks);
    endGasReport();

    startGasReport("get field from Callbacks (warm)");
    bytes24[] memory returnedCallbacks = Callbacks.get(key);
    endGasReport();

    assertEq(returnedCallbacks.length, callbacks.length);
    assertEq(returnedCallbacks[0], callbacks[0]);

    startGasReport("push field to Callbacks");
    Callbacks.push(key, callbacks[0]);
    endGasReport();

    returnedCallbacks = Callbacks.get(key);

    assertEq(returnedCallbacks.length, 2);
    assertEq(returnedCallbacks[1], callbacks[0]);
  }
}
