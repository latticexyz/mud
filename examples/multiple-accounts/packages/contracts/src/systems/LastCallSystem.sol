// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { LastCall } from "../codegen/index.sol";

contract LastCallSystem is System {
  function newCall() public {
    LastCall.set(_msgSender(), block.timestamp, tx.origin);
  }
}
