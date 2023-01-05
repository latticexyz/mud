// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../systems/StdSystem.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibStorage as s } from "../libraries/LibStorage.sol";
import { console } from "forge-std/console.sol";

uint256 constant ID = uint256(keccak256("system.sample"));

contract SampleSystem is StdSystem {
  constructor(IWorld _world, address _components) StdSystem(_world, _components) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    if (address(s.w()) == address(world)) {
      console.log("World is correct");
    }
    if (address(s.c()) == address(components)) {
      console.log("Components are correct");
    }
  }

  function executeTyped() external returns (bytes memory) {
    return execute(abi.encode(""));
  }
}
