// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "./interfaces/IWorld.sol";

import { System } from "./System.sol";

/**
 * @title System with preconfigured external endpoints.
 */
abstract contract ExternalSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  /**
   * @dev Execute as `msg.sender`
   */
  function execute(bytes memory args) public returns (bytes memory) {
    // TODO remove return
    return _execute(msg.sender, args);
  }

  /**
   * @dev Check if `msg.sender` has approval from `from`, then execute as `from`
   */
  function executeFrom(address from, bytes memory args) public {
    requireApproved(from, args);
    _execute(from, args);
  }

  /**
   * @dev Check if `msg.sender` has approval from `this` (the system itself), then execute as `from`.
   */
  function executeInternal(address from, bytes memory args) public {
    requireApproved(address(this), args);
    _execute(from, args);
  }

  function _execute(address from, bytes memory args) internal virtual returns (bytes memory);
}
