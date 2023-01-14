// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "./interfaces/IWorld.sol";

import { System } from "./System.sol";

/**
 * @title Internal system template.
 */
abstract contract Subsystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function requireApproved() internal {
    bytes memory emptyArgs;
    requireApproved(address(this), emptyArgs);
  }
}
