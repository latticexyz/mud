// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

// External
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibStorage as s, worldID, componentsID } from "../libraries/LibStorage.sol";

abstract contract StdSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {
    s.storeAddress(worldID, address(world));
    s.storeAddress(componentsID, address(components));
  }
}
