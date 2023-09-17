// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { console } from "forge-std/console.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { CounterTable } from "../codegen/index.sol";

contract IncrementSystem is System {
  error MyCustomError();

  function increment() public returns (uint32) {
    uint32 counter = CounterTable.get();
    uint32 newValue = counter + 1;
    CounterTable.set(newValue);
    return newValue;
  }

  function willRevert() public {
    // revert("I told you it would revert");
    CounterTable.register();
    // revert MyCustomError();
  }
}
