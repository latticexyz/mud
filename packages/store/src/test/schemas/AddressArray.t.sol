// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { StoreView } from "../../StoreView.sol";
import { AddressArray, AddressArray_ } from "../../schemas/AddressArray.sol";

bytes32 constant tableId = keccak256("mud.store.table.addressArray");

contract AddressArrayTest is Test, StoreView {
  function testSetAndGet() public {
    AddressArray_.registerSchema(tableId);
    bytes32 key = keccak256("somekey");

    address[] memory addresses = new address[](1);
    addresses[0] = address(this);

    // !gasreport set record in AddressArrayTable
    AddressArray_.set(tableId, key, addresses);

    // !gasreport get record from AddressArrayTable (warm)
    address[] memory returnedAddresses = AddressArray_.get(tableId, key);

    assertEq(returnedAddresses.length, addresses.length);
    assertEq(returnedAddresses[0], addresses[0]);

    // !gasreport push record to AddressArrayTable
    AddressArray_.push(tableId, key, addresses[0]);

    returnedAddresses = AddressArray_.get(tableId, key);

    assertEq(returnedAddresses.length, 2);
    assertEq(returnedAddresses[1], addresses[0]);
  }
}
