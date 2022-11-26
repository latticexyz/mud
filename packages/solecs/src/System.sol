// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ISystem } from "./interfaces/ISystem.sol";
import { IUint256Component } from "./interfaces/IUint256Component.sol";
import { IWorld } from "./interfaces/IWorld.sol";

import { Ownable } from "./Ownable.sol";

/**
 * System base contract
 */
abstract contract System is ISystem, Ownable {
  IUint256Component components;
  IWorld world;

  constructor(IWorld _world, address _components) {
    components = _components == address(0) ? _world.components() : IUint256Component(_components);
    world = _world;
  }
}
