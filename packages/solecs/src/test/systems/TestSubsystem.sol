// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IWorld } from "../../interfaces/IWorld.sol";
import { Subsystem } from "../../Subsystem.sol";

contract TestSubsystem is Subsystem {
  uint256 public constant ID = uint256(keccak256("lib.testSubsystem"));

  constructor(IWorld _world, address _components) Subsystem(_world, _components) {}

  function _execute(bytes memory args) internal pure override returns (bytes memory) {
    return args;
  }
}
