// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ISystem } from "./interfaces/ISystem.sol";
import { IUint256Component } from "./interfaces/IUint256Component.sol";
import { IWorld } from "./interfaces/IWorld.sol";
import { SystemStorage } from "./SystemStorage.sol";

/**
 * System base contract
 */
abstract contract System is ISystem {
  IUint256Component components;
  IWorld world;
  address _owner;

  modifier onlyOwner() {
    require(msg.sender == _owner, "ONLY_OWNER");
    _;
  }

  constructor(IWorld _world, address _components) {
    _owner = msg.sender;
    // @deprecated use SystemStorage.components() instead of components
    components = _components == address(0) ? _world.components() : IUint256Component(_components);
    // @deprecated use SystemStorage.world() instead of world
    world = _world;
    SystemStorage.init(world, components);
  }

  function owner() public view override returns (address) {
    return _owner;
  }

  function transferOwnership(address newOwner) public override onlyOwner {
    emit OwnershipTransferred(_owner, newOwner);
    _owner = newOwner;
  }
}
