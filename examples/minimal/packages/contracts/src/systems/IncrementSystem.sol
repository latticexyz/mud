// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { console } from "forge-std/console.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { CounterTable, PositionTable } from "../codegen/Tables.sol";

bytes32 constant SingletonKey = bytes32(uint256(0x060D));

contract IncrementSystem is System {
  error MyCustomError();

  function increment() public returns (uint32) {
    bytes32 key = SingletonKey;
    uint32 counter = CounterTable.get(key);
    uint32 newValue = counter + 1;
    CounterTable.set(key, newValue);
    return newValue;
  }

  function addPosition(bytes32 key, int32 x, int32 y) public {
    PositionTable.set(key, x, y);
  }

  function willRevert() public {
    // revert("I told you it would revert");
    CounterTable.registerSchema();
    // revert MyCustomError();
  }
}
