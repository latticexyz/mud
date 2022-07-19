// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";

uint256 constant ID = uint256(keccak256("ember.system.move"));

contract MoveSystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 entity, Coord memory targetPosition) = abi.decode(arguments, (uint256, Coord));

    PositionComponent position = PositionComponent(getAddressById(components, PositionComponentID));
    position.set(entity, targetPosition);
  }

  function executeTyped(uint256 entity, Coord memory targetPosition) public returns (bytes memory) {
    return execute(abi.encode(entity, targetPosition));
  }
}
