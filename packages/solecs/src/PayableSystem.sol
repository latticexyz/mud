// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IPayableSystem } from "./interfaces/IPayableSystem.sol";
import { IUint256Component } from "./interfaces/IUint256Component.sol";
import { IWorld } from "./interfaces/IWorld.sol";

/**
 * System base contract
 */
abstract contract PayableSystem is IPayableSystem {
  IUint256Component components;
  IWorld world;
  address _owner;

  modifier onlyOwner() {
    require(msg.sender == _owner, "ONLY_OWNER");
    _;
  }

  constructor(IWorld _world, address _components) {
    _owner = msg.sender;
    components = _components == address(0) ? _world.components() : IUint256Component(_components);
    world = _world;
  }

  function owner() public view returns (address) {
    return _owner;
  }
}
