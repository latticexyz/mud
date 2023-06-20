// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";
import { IStoreConsumer } from "@latticexyz/store/src/StoreConsumer.sol";

contract MudV2Test is Test, IStoreConsumer {
  address worldAddress;

  function setUp() public virtual {
    worldAddress = vm.parseAddress(vm.readFile(".mudtest"));
  }

  function storeAddress(address) public view returns (address) {
    return worldAddress;
  }
}
