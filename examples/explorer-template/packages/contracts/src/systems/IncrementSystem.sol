// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";

import { OffchainCounter, Counter, Checkboxes, Checked } from "../codegen/index.sol";

import { console } from "forge-std/console.sol";
import { indexToEntityKey } from "../indexToEntityKey.sol";

contract IncrementSystem is System {
  function increment() public returns (uint32) {
    uint32 counter = Counter.get();
    uint32 newValue = counter + 1;
    Counter.set(newValue);
    return newValue;
  }

  function incrementOffchain() public returns (uint32) {
    uint32 newValue = 42;
    OffchainCounter.set(newValue);
    return newValue;
  }

  function decrement() public returns (uint32) {
    uint32 counter = Counter.get();
    uint32 newValue = counter - 1;
    Counter.set(newValue);
    return newValue;
  }

  function addCheckbox(uint256 _idx, bool _checked) public {
    // Checkboxes.set(_id, _checked);

    bytes32 entity = indexToEntityKey(_idx);
    Checked.set(entity, _checked);
  }

  function toggleCheckbox(bytes32 _entity) public {
    // bool checked = Checkboxes.get(_id);
    // Checkboxes.set(_id, !checked);

    bool checked = Checked.get(_entity);
    Checked.set(_entity, !checked);
  }
}
