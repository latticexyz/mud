// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";
import { LibPersona } from "../libraries/LibPersona.sol";
import { LibQuery } from "solecs/LibQuery.sol";
import { LibBlueprint, SoldierID } from "../libraries/LibBlueprint.sol";

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
    uint256 playerEntity = createPlayerEntity();
    spawnSoldier(playerEntity, Coord(position.x, position.y));
    spawnSoldier(playerEntity, Coord(position.x + 1, position.y));
    spawnSoldier(playerEntity, Coord(position.x - 1, position.y));
    spawnSoldier(playerEntity, Coord(position.x, position.y + 1));
    spawnSoldier(playerEntity, Coord(position.x, position.y - 1));
  }

  function spawnSoldier(uint256 ownerId, Coord memory position) private {
    (, bool foundTargetEntity) = LibUtils.getEntityAt(s.world, position);
    require(!foundTargetEntity, "spot taken fool!");

    PositionComponent positionComponent = PositionComponent(s.world.getComponent(PositionComponentID));
    LastActionTurnComponent lastActionTurnComponent = LastActionTurnComponent(
      s.world.getComponent(LastActionTurnComponentID)
    );

    uint256 entity = LibBlueprint.createFromBlueprint(SoldierID, ownerId);
    positionComponent.set(entity, position);
    lastActionTurnComponent.set(entity, LibStamina.getCurrentTurn());
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
