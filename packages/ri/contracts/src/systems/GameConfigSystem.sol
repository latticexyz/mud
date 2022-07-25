// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { GameConfigComponent, ID as GameConfigComponentID, GameConfig, GodID } from "../components/GameConfigComponent.sol";

uint256 constant ID = uint256(keccak256("mudwar.system.GameConfig"));

contract GameConfigSystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function requirement(bytes memory) public view returns (bytes memory) {
    require(msg.sender == _owner, "only owner can set config");
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    requirement(arguments);
    GameConfigComponent(getAddressById(components, GameConfigComponentID)).set(
      GodID,
      GameConfig({ startTime: block.timestamp, turnLength: uint256(20) })
    );
  }

  function requirementTyped() public view returns (bytes memory) {
    return requirement(new bytes(0));
  }

  function executeTyped() public returns (bytes memory) {
    return execute(new bytes(0));
  }
}
