// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Number } from "../codegen/index.sol";

contract NumberSystem is System {
  function setNumber(uint32 key, uint32 value) public {
    Number.set(key, value);
  }
}
