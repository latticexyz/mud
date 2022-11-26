// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "./interfaces/IUint256Component.sol";
import { IWorld } from "./interfaces/IWorld.sol";

library SystemStorage {
  struct Layout {
    IUint256Component components;
    IWorld world;
  }

  bytes32 internal constant STORAGE_SLOT = keccak256("solecs.contracts.storage.System");

  function layout() internal pure returns (Layout storage l) {
    bytes32 slot = STORAGE_SLOT;
    assembly {
      l.slot := slot
    }
  }

  function initSystem(
    Layout storage l,
    IUint256Component components,
    IWorld world
  ) internal {
    l.components = components;
    l.world = world;
  }
}
