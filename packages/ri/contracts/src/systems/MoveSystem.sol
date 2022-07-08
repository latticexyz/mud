// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibECS } from "std-contracts/libraries/LibECS.sol";

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { StaminaComponent, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";
import { GameConfigComponent, ID as GameConfigComponentID } from "../components/GameConfigComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";

uint256 constant ID = uint256(keccak256("ember.system.move"));

contract MoveSystem is ISystem {
  IUint256Component components;

  constructor(IUint256Component _components, IWorld) {
    components = _components;
  }

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    (uint256 entity, Coord memory targetPosition) = abi.decode(arguments, (uint256, Coord));

    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    require(LibECS.isOwnedByCaller(ownedByComponent, entity), "you don't own this entity");

    MovableComponent movableComponent = MovableComponent(getAddressById(components, MovableComponentID));
    require(movableComponent.has(entity), "trying to move non-moving entity");

    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    require(LibUtils.manhattan(positionComponent.getValue(entity), targetPosition) == 1, "not adjacent");

    (, bool foundTargetEntity) = LibUtils.getEntityWithAt(components, UntraversableComponentID, targetPosition);
    require(!foundTargetEntity, "entity blocking intended direction");

    StaminaComponent staminaComponent = StaminaComponent(getAddressById(components, StaminaComponentID));
    require(staminaComponent.has(entity), "entity has no stamina");

    LastActionTurnComponent lastActionTurnComponent = LastActionTurnComponent(
      getAddressById(components, LastActionTurnComponentID)
    );
    require(lastActionTurnComponent.has(entity), "entity has no last action turn");

    return abi.encode(entity, targetPosition, positionComponent, staminaComponent, lastActionTurnComponent);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (
      uint256 entity,
      Coord memory targetPosition,
      PositionComponent positionComponent,
      StaminaComponent staminaComponent,
      LastActionTurnComponent lastActionTurnComponent
    ) = abi.decode(
        requirement(arguments),
        (uint256, Coord, PositionComponent, StaminaComponent, LastActionTurnComponent)
      );
    positionComponent.set(entity, targetPosition);

    LibStamina.modifyStamina(
      staminaComponent,
      lastActionTurnComponent,
      GameConfigComponent(getAddressById(components, GameConfigComponentID)),
      entity,
      1
    );
  }

  function requirementTyped(uint256 entity, Coord memory targetPosition) public view returns (bytes memory) {
    return requirement(abi.encode(entity, targetPosition));
  }

  function executeTyped(uint256 entity, Coord memory targetPosition) public returns (bytes memory) {
    return execute(abi.encode(entity, targetPosition));
  }
}
