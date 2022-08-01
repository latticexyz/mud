// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { ISystem } from "./interfaces/ISystem.sol";
import { IUint256Component } from "./interfaces/IUint256Component.sol";
import { IWorld } from "./interfaces/IWorld.sol";

abstract contract System is ISystem {
  IUint256Component components;
  IWorld world;
  address _owner;

  constructor(IWorld _world, address _components) {
    _owner = msg.sender;
    components = _components == address(0) ? _world.components() : IUint256Component(_components);
    world = _world;
  }

  function owner() public view returns (address) {
    return _owner;
  }
}
