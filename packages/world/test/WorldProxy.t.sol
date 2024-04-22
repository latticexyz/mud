// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { WorldTest } from "./World.t.sol";
import { createWorldProxy } from "./createWorldProxy.sol";

contract WorldProxyTest is WorldTest {
  function setUp() public override {
    world = createWorldProxy();
    StoreSwitch.setStoreAddress(address(world));

    key = "testKey";
    keyTuple = new bytes32[](1);
    keyTuple[0] = key;
    singletonKey = new bytes32[](0);
  }
}
