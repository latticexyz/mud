// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Test.sol";

contract MudV2Test is Test {
  address worldAddress;

  function setUp() public virtual {
    worldAddress = vm.parseAddress(vm.readFile(".mudtest"));
  }
}
