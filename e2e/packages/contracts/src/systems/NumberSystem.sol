// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { EncodeArray } from "@latticexyz/store/src/tightcoder/EncodeArray.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { Number } from "../codegen/index.sol";

contract NumberSystem is System {
  function setNumber(uint32 key, uint32 value) public {
    Number.set(key, value);
  }
}
