// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { console } from "forge-std/console.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { CounterTable } from "../codegen/index.sol";

contract DoubleSystem is System {
  function double() public returns (uint32) {
    uint32 counter = CounterTable.get();
    uint32 newValue = counter * 2;
    CounterTable.set(newValue);
    return newValue;
  }
}
