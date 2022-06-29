// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";
import { UsingDiamondOwner } from "../diamond/utils/UsingDiamondOwner.sol";
import { UsingAccessControl } from "../access/UsingAccessControl.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";
import { LibDiamond, DiamondStorage } from "../diamond/libraries/LibDiamond.sol";
import { LibPersona } from "../libraries/LibPersona.sol";
import { LibUtils } from "../libraries/LibUtils.sol";
import { QueryFragment, QueryType } from "solecs/interfaces/Query.sol";
import { LibQuery } from "solecs/LibQuery.sol";
import { LibECS } from "../libraries/LibECS.sol";

import { GameConfigComponent, ID as GameConfigComponentID, GameConfig, GodID } from "../components/GameConfigComponent.sol";
import { PersonaComponent, ID as PersonaComponentID } from "../components/PersonaComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";

// Stamina
import { MaxStaminaComponent, ID as MaxStaminaComponentID } from "../components/MaxStaminaComponent.sol";
import { CurrentStaminaComponent, ID as CurrentStaminaComponentID } from "../components/CurrentStaminaComponent.sol";
import { StaminaRegenerationComponent, ID as StaminaRegenerationComponentID } from "../components/StaminaRegenerationComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";

contract EmberFacet is UsingDiamondOwner, UsingAccessControl {
  AppStorage internal s;

  function world() external view returns (address) {
    return address(s.world);
  }

  function joinGame(Coord calldata position) external {
    (, bool foundTargetEntity) = LibUtils.getEntityAt(s.world, position);
    require(!foundTargetEntity, "spot taken fool!");

    uint256 playerEntity = createPlayerEntity();
    createCreature(playerEntity, Coord(position.x, position.y));
    createCreature(playerEntity, Coord(position.x + 1, position.y));
    createCreature(playerEntity, Coord(position.x - 1, position.y));
    createCreature(playerEntity, Coord(position.x, position.y + 1));
    createCreature(playerEntity, Coord(position.x, position.y - 1));
  }

  function createCreature(uint256 ownerId, Coord memory position) private {
    EntityTypeComponent entityTypeComponent = EntityTypeComponent(s.world.getComponent(EntityTypeComponentID));
    PositionComponent positionComponent = PositionComponent(s.world.getComponent(PositionComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(s.world.getComponent(OwnedByComponentID));
    MaxStaminaComponent maxStamina = MaxStaminaComponent(s.world.getComponent(MaxStaminaComponentID));
    CurrentStaminaComponent currentStamina = CurrentStaminaComponent(s.world.getComponent(CurrentStaminaComponentID));
    StaminaRegenerationComponent staminaRegeneration = StaminaRegenerationComponent(
      s.world.getComponent(StaminaRegenerationComponentID)
    );
    LastActionTurnComponent lastActionTurn = LastActionTurnComponent(s.world.getComponent(LastActionTurnComponentID));
    MovableComponent movableComponent = MovableComponent(s.world.getComponent(MovableComponentID));

    uint256 entity = s.world.getUniqueEntityId();

    ownedByComponent.set(entity, ownerId);
    entityTypeComponent.set(entity, uint32(0));
    positionComponent.set(entity, position);
    maxStamina.set(entity, 3);
    currentStamina.set(entity, 0);
    staminaRegeneration.set(entity, 1);
    lastActionTurn.set(entity, getCurrentTurn());
    movableComponent.set(entity);
  }

  function createPlayerEntity() private returns (uint256 playerEntity) {
    PersonaComponent personaComponent = PersonaComponent(s.world.getComponent(PersonaComponentID));
    uint256 personaId = LibPersona.getActivePersona();
    require(personaId != 0, "no persona found");

    QueryFragment[] memory fragments = new QueryFragment[](1);
    fragments[0] = QueryFragment(QueryType.HasValue, personaComponent, abi.encode(personaId));
    uint256[] memory entities = LibQuery.query(fragments);
    require(entities.length == 0, "already spawned");

    playerEntity = s.world.getUniqueEntityId();
    personaComponent.set(playerEntity, personaId);
  }

  function moveEntity(uint256 entity, Coord calldata targetPosition) external populateCallerEntityID {
    require(LibECS.doesCallerEntityIDOwnEntity(entity), "You don't own this entity");

    MovableComponent movableComponent = MovableComponent(s.world.getComponent(MovableComponentID));
    require(movableComponent.has(entity), "trying to move non-moving entity");

    PositionComponent positionComponent = PositionComponent(s.world.getComponent(PositionComponentID));
    require(LibUtils.manhattan(positionComponent.getValue(entity), targetPosition) == 1, "not adjacent");

    (, bool foundTargetEntity) = LibUtils.getEntityWithAt(s.world, UntraversableComponentID, targetPosition);
    require(!foundTargetEntity, "entity blocking intended direction");

    positionComponent.set(entity, targetPosition);
    reduceStamina(entity, 1);
  }

  function reduceStamina(uint256 entity, uint32 amount) private {
    MaxStaminaComponent maxStamina = MaxStaminaComponent(s.world.getComponent(MaxStaminaComponentID));
    require(maxStamina.has(entity), "entity does not have stamina");

    CurrentStaminaComponent currentStamina = CurrentStaminaComponent(s.world.getComponent(CurrentStaminaComponentID));
    require(currentStamina.has(entity), "entity does not have stamina");

    StaminaRegenerationComponent staminaRegeneration = StaminaRegenerationComponent(
      s.world.getComponent(StaminaRegenerationComponentID)
    );
    require(staminaRegeneration.has(entity), "entity does not have stamina");

    LastActionTurnComponent lastActionTurn = LastActionTurnComponent(s.world.getComponent(LastActionTurnComponentID));
    require(lastActionTurn.has(entity), "entity does not have stamina");

    uint32 currentTurn = getCurrentTurn();
    uint32 staminaSinceLastAction = uint32(
      (currentTurn - lastActionTurn.getValue(entity)) * staminaRegeneration.getValue(entity)
    );
    uint32 stamina = currentStamina.getValue(entity) + staminaSinceLastAction;

    if (stamina > maxStamina.getValue(entity)) {
      stamina = maxStamina.getValue(entity);
    }

    require(stamina >= amount, "not enough stamina to move");

    lastActionTurn.set(entity, currentTurn);
    currentStamina.set(entity, stamina - amount);
  }

  function getCurrentTurn() public view returns (uint32) {
    GameConfigComponent gameConfigComponent = GameConfigComponent(s.world.getComponent(GameConfigComponentID));
    GameConfig memory gameConfig = gameConfigComponent.getValue(GodID);

    uint256 secondsSinceGameStart = block.timestamp - gameConfig.startTime;
    return uint32(secondsSinceGameStart / gameConfig.turnLength);
  }

  function configureWorld() public {
    GameConfigComponent gameConfigComponent = GameConfigComponent(s.world.getComponent(GameConfigComponentID));
    gameConfigComponent.set(GodID, GameConfig({ startTime: block.timestamp, turnLength: uint256(20) }));
  }
}
