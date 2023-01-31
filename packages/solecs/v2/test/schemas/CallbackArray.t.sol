// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { StoreView } from "../../StoreView.sol";
import { CallbackArray, CallbackArray_ } from "../../schemas/CallbackArray.sol";

bytes32 constant tableId = keccak256("mud.store.table.callbackArray");

contract CallbackArrayTest is DSTestPlus, StoreView {
  function testSetAndGet() public {
    CallbackArray_.registerSchema(tableId);
    bytes32 key = keccak256("somekey");

    bytes24[] memory callbacks = new bytes24[](1);
    callbacks[0] = bytes24(abi.encode(this.testSetAndGet));

    // !gasreport set record in CallbackArrayTable
    CallbackArray_.set(tableId, key, callbacks);

    // !gasreport get record from CallbackArrayTable (warm)
    bytes24[] memory returnedCallbacks = CallbackArray_.get(tableId, key);

    assertEq(returnedCallbacks.length, callbacks.length);
    assertEq(returnedCallbacks[0], callbacks[0]);

    // !gasreport push record to CallbackArrayTable
    CallbackArray_.push(tableId, key, callbacks[0]);

    returnedCallbacks = CallbackArray_.get(tableId, key);

    assertEq(returnedCallbacks.length, 2);
    assertEq(returnedCallbacks[1], callbacks[0]);
  }
}
