// SPDX-License-Identifier: MIT
pragma solidity >=0.8.28;

import { System } from "@latticexyz/world/src/System.sol";
import { Value } from "./codegen/tables/Value.sol";

contract ASystem is System {
  function setValue(uint256 value) external {
    Value.set(value);
  }

  function getValue() external view returns (uint256) {
    return Value.get();
  }

  function getTwoValues() external view returns (uint256, uint256) {
    return (Value.get(), Value.get());
  }
}
