// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Test } from "forge-std/Test.sol";
import { IStoreConsumer } from "./StoreConsumer.sol";

contract MudTest is Test, IStoreConsumer {
  address worldAddress;

  function setUp() public virtual {
    worldAddress = vm.parseAddress(vm.readFile(".mudtest"));
  }

  function storeAddress(address) public view returns (address) {
    return worldAddress;
  }
}
