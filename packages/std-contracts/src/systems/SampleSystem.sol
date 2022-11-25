// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById, getSystemAddressById } from "solecs/utils.sol";
import { LibStorage as s } from "../libraries/LibStorage.sol";

uint256 constant ID = uint256(keccak256("system.sample"));

contract SampleSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function requirement(bytes memory) public view returns (bytes memory) {
    // NOTE: Make sure to not include this system in a production deployment, as anyone can change all component values
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    //
  }

  function executeTyped() external returns (bytes memory) {
    return execute(abi.encode(""));
  }
}
