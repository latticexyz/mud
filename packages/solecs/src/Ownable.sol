// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Ownable as SolidStateOwnable } from "@solidstate/contracts/access/ownable/Ownable.sol";
import { OwnableStorage } from "@solidstate/contracts/access/ownable/OwnableStorage.sol";

/**
 * IERC173 implementation
 */
contract Ownable is SolidStateOwnable {
  using OwnableStorage for OwnableStorage.Layout;

  constructor() {
    // Initialize owner (SolidState has no constructors)
    OwnableStorage.layout().owner = msg.sender;
  }
}
