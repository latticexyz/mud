// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";

contract MudTest is Test {
  address worldAddress;

  function setUp() public virtual {
    worldAddress = vm.parseAddress(vm.readFile(".mudtest"));
    StoreSwitch.setStoreAddress(worldAddress);
  }

  function storeAddress() public view returns (address) {
    return worldAddress;
  }
}
