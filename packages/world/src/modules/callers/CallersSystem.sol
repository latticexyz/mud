// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "../../System.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Callers } from "./tables/Callers.sol";
import { NAMESPACE, TABLE_NAME } from "./constants.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { console } from "forge-std/console.sol";

contract CallersSystem is System {
  uint storedData;

  function pushCaller(address caller) public {
    // console.log("pushCaller");
    storedData += 1;
    // address world = StoreSwitch.getStoreAddress();
    // require(world == msg.sender, "CallersSystem: can only be called by the World contract");
    // bytes32 tableId = ResourceSelector.from(NAMESPACE, TABLE_NAME);
    // Callers.push(tableId, caller);
  }

  function popCaller() public {
    // console.log("pushCaller");
    // address world = StoreSwitch.getStoreAddress();
    // require(world == msg.sender, "CallersSystem: can only be called by the World contract");
    // bytes32 tableId = ResourceSelector.from(NAMESPACE, TABLE_NAME);
    // Callers.pop(tableId);
  }

  function getLatestCaller() public view returns (address) {
    bytes32 tableId = ResourceSelector.from(NAMESPACE, TABLE_NAME);
    address[] memory callers = Callers.get(tableId);
    if (callers.length > 0) {
      return callers[0];
    }
    return address(0);
  }
}
