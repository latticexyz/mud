// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { Vector } from "../codegen/index.sol";

contract VectorSystem is System {
  function setVector(uint32 key, int32 x, int32 y) public {
    Vector.set(key, x, y);
  }
}
