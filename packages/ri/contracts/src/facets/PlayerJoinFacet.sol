// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";
import { LibPersona } from "../libraries/LibPersona.sol";
import { LibQuery } from "solecs/LibQuery.sol";

import { World } from "solecs/World.sol";
import { UsingDiamondOwner } from "../diamond/utils/UsingDiamondOwner.sol";
import { UsingAccessControl } from "../access/UsingAccessControl.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";

import { QueryFragment, QueryType } from "solecs/interfaces/Query.sol";

import { GameConfigComponent, ID as GameConfigComponentID, GameConfig, GodID } from "../components/GameConfigComponent.sol";
import { PersonaComponent, ID as PersonaComponentID } from "../components/PersonaComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { StaminaComponent, Stamina, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";
import { HealthComponent, Health, ID as HealthComponentID } from "../components/HealthComponent.sol";
import { AttackComponent, Attack, ID as AttackComponentID } from "../components/AttackComponent.sol";

contract PlayerJoinFacet is UsingDiamondOwner, UsingAccessControl {
  AppStorage internal s;

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
    HealthComponent healthComponent = HealthComponent(s.world.getComponent(HealthComponentID));
    AttackComponent attackComponent = AttackComponent(s.world.getComponent(AttackComponentID));

    uint256 entity = s.world.getUniqueEntityId();

    ownedByComponent.set(entity, ownerId);
    entityTypeComponent.set(entity, uint32(0));
    positionComponent.set(entity, position);
    staminaComponent.set(entity, Stamina({ current: 0, max: 3, regeneration: 1 }));
    healthComponent.set(entity, Health({ current: 100_000, max: 100_000 }));
    attackComponent.set(entity, Attack({ strength: 60_000, range: 1 }));
    lastActionTurn.set(entity, LibStamina.getCurrentTurn());
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
}
