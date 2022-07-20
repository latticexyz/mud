// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { LibUtils } from "std-contracts/libraries/LibUtils.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { CarriedByComponent, ID as CarriedByComponentID } from "../components/CarriedByComponent.sol";

uint256 constant ID = uint256(keccak256("ember.system.catch"));

contract CatchSystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function execute(bytes memory arguments) public returns (bytes memory) {
    Coord memory targetPosition = abi.decode(arguments, (Coord));

    PositionComponent position = PositionComponent(getAddressById(components, PositionComponentID));

    // Sender must be next to target position
    Coord memory senderPosition = position.getValue(addressToEntity(msg.sender));
    require(LibUtils.manhattan(senderPosition, targetPosition) == 1, "must be adjacent to catch");

    // Find entities at the target position
    uint256[] memory entities = position.getEntitiesWithValue(targetPosition);
    require(entities.length > 0, "no entities at this position");

    CarriedByComponent carriedBy = CarriedByComponent(getAddressById(components, CarriedByComponentID));

    // Catch all the entities
    for (uint256 i; i < entities.length; i++) {
      position.remove(entities[i]);
      carriedBy.set(entities[i], addressToEntity(msg.sender));
    }
  }

  function executeTyped(Coord memory targetPosition) public returns (bytes memory) {
    return execute(abi.encode(targetPosition));
  }
}
