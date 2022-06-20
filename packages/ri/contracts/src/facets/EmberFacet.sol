// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { PersonaComponent, ID as PersonaComponentID } from "../components/PersonaComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";
import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";
import { UsingDiamondOwner } from "../diamond/utils/UsingDiamondOwner.sol";
import { UsingAccessControl } from "../access/UsingAccessControl.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";
import { LibDiamond, DiamondStorage } from "../diamond/libraries/LibDiamond.sol";
import { LibPersona } from "../libraries/LibPersona.sol";
import { manhattan, getEntityAt, getEntityWithAt } from "../utils/utils.sol";
import { QueryFragment, QueryType } from "solecs/interfaces/Query.sol";
import { LibQuery } from "solecs/LibQuery.sol";

contract EmberFacet is UsingDiamondOwner, UsingAccessControl {
  AppStorage internal s;

  function world() external view returns (address) {
    return address(s.world);
  }

  // Debugging
  function callerEntityID() external view returns (uint256) {
    return s._callerEntityID;
  }

  // Debugging
  function addComponentToEntityExternally(
    uint256 entity,
    uint256 componentId,
    bytes memory value
  ) external {
    Component c = Component(s.world.getComponent(componentId));
    c.set(entity, value);
  }

  // Debugging
  function removeComponentFromEntityExternally(uint256 entity, uint256 componentId) external {
    Component c = Component(s.world.getComponent(componentId));
    c.remove(entity);
  }

  function joinGame(Coord calldata position, uint32 entityType) external {
    PersonaComponent personaComponent = PersonaComponent(s.world.getComponent(PersonaComponentID));
    uint256 personaId = LibPersona.getActivePersona();
    require(personaId != 0, "no persona found");

    QueryFragment[] memory fragments = new QueryFragment[](1);
    fragments[0] = QueryFragment(QueryType.HasValue, personaComponent, abi.encode(personaId));
    uint256[] memory entities = LibQuery.query(fragments);
    require(entities.length == 0, "already spawned");

    EntityTypeComponent entityTypeComponent = EntityTypeComponent(s.world.getComponent(EntityTypeComponentID));
    PositionComponent positionComponent = PositionComponent(s.world.getComponent(PositionComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(s.world.getComponent(OwnedByComponentID));

    (, bool foundTargetEntity) = getEntityAt(s.world, position);
    require(!foundTargetEntity, "spot taken fool!");

    uint256 playerEntity = s.world.getUniqueEntityId();
    personaComponent.set(playerEntity, personaId);

    uint256 entity = s.world.getUniqueEntityId();
    entityTypeComponent.set(entity, entityType);
    positionComponent.set(entity, position);
    ownedByComponent.set(entity, playerEntity);

    if (entityType == 0) {
      MovableComponent movableComponent = MovableComponent(s.world.getComponent(MovableComponentID));
      movableComponent.set(entity);
    }
  }

  function moveEntity(uint256 entity, Coord calldata targetPosition) external {
    MovableComponent movableComponent = MovableComponent(s.world.getComponent(MovableComponentID));
    require(movableComponent.has(entity), "trying to move non-moving entity");

    PositionComponent positionComponent = PositionComponent(s.world.getComponent(PositionComponentID));
    require(manhattan(positionComponent.getValue(entity), targetPosition) == 1, "not adjacent");

    (, bool foundTargetEntity) = getEntityWithAt(s.world, UntraversableComponentID, targetPosition);
    if (!foundTargetEntity) {
      return positionComponent.set(entity, targetPosition);
    }

    revert("Invalid action");
  }

  // Entry Points. Debugging only
  function entryPoint() public populateCallerEntityID {}
}
