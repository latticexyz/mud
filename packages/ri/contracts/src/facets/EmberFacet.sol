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
import { StaminaComponent, Stamina, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
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
    StaminaComponent staminaComponent = StaminaComponent(s.world.getComponent(StaminaComponentID));
    LastActionTurnComponent lastActionTurn = LastActionTurnComponent(s.world.getComponent(LastActionTurnComponentID));
    MovableComponent movableComponent = MovableComponent(s.world.getComponent(MovableComponentID));

    uint256 entity = s.world.getUniqueEntityId();

    ownedByComponent.set(entity, ownerId);
    entityTypeComponent.set(entity, uint32(0));
    positionComponent.set(entity, position);
    staminaComponent.set(entity, Stamina({ current: 0, max: 3, regeneration: 1 }));
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
    StaminaComponent staminaComponent = StaminaComponent(s.world.getComponent(StaminaComponentID));
    require(staminaComponent.has(entity), "entity does not have stamina");

    LastActionTurnComponent lastActionTurnComponent = LastActionTurnComponent(
      s.world.getComponent(LastActionTurnComponentID)
    );
    require(lastActionTurnComponent.has(entity), "entity does not have stamina");

    Stamina memory stamina = staminaComponent.getValue(entity);
    uint32 currentTurn = getCurrentTurn();
    uint32 staminaSinceLastAction = uint32(
      (currentTurn - lastActionTurnComponent.getValue(entity)) * stamina.regeneration
    );
    uint32 updatedStamina = stamina.current + staminaSinceLastAction;

    if (updatedStamina > stamina.max) {
      updatedStamina = stamina.max;
    }

    require(updatedStamina >= amount, "not enough stamina to move");

    lastActionTurnComponent.set(entity, currentTurn);
    staminaComponent.set(
      entity,
      Stamina({ current: updatedStamina - amount, max: stamina.max, regeneration: stamina.regeneration })
    );
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
