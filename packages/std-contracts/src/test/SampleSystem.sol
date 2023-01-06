// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { SystemStorage as s } from "../libraries/SystemStorage.sol";
import { console } from "forge-std/console.sol";

uint256 constant ID = uint256(keccak256("system.sample"));

contract SampleSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    require(address(s.world()) == address(world), "World address is incorrect");
    require(address(s.components()) == address(components), "Components address is incorrect");
  }

  function executeTyped() external returns (bytes memory) {
    return execute(abi.encode(""));
  }
}
