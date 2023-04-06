// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreView } from "../../src/StoreView.sol";
import { Callbacks } from "../../src/codegen/Tables.sol";

contract CallbacksTest is Test, StoreView {
  function testSetAndGet() public {
    Callbacks.registerSchema();
    bytes32 key = keccak256("somekey");

    bytes24[] memory callbacks = new bytes24[](1);
    callbacks[0] = bytes24(abi.encode(this.testSetAndGet));

    // !gasreport set field in Callbacks
    Callbacks.set(key, callbacks);

    // !gasreport get field from Callbacks (warm)
    bytes24[] memory returnedCallbacks = Callbacks.get(key);

    assertEq(returnedCallbacks.length, callbacks.length);
    assertEq(returnedCallbacks[0], callbacks[0]);

    // !gasreport push field to Callbacks
    Callbacks.push(key, callbacks[0]);

    returnedCallbacks = Callbacks.get(key);

    assertEq(returnedCallbacks.length, 2);
    assertEq(returnedCallbacks[1], callbacks[0]);
  }
}
