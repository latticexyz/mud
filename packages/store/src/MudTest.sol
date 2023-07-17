// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { setStoreAddress } from "./StoreConsumer.sol";

contract MudTest is Test {
  address worldAddress;

  function setUp() public virtual {
    worldAddress = vm.parseAddress(vm.readFile(".mudtest"));
    setStoreAddress(worldAddress);
  }

  function storeAddress() public view returns (address) {
    return worldAddress;
  }
}
