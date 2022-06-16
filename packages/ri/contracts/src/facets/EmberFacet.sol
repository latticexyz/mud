// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";
import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";
import { UsingDiamondOwner } from "../diamond/utils/UsingDiamondOwner.sol";
import { UsingAccessControl } from "../access/UsingAccessControl.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";
import { manhattan, getEntityAt, getEntityWithAt } from "../utils/utils.sol";

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

  // function spawnCreature(Coord calldata position) external {
  //   EntityTypeComponent entityTypeComponent = EntityTypeComponent(s.world.getComponent(EntityTypeComponentID));
  //   PositionComponent positionComponent = PositionComponent(s.world.getComponent(PositionComponentID));

  //   uint256 entity = s.world.getUniqueEntityId();

  //   entityTypeComponent.set(entity, 0);
  //   positionComponent.set(entity, position);
  // }

  function spawnCreature(Coord calldata position, uint32 entityType) external {
    EntityTypeComponent entityTypeComponent = EntityTypeComponent(s.world.getComponent(EntityTypeComponentID));
    PositionComponent positionComponent = PositionComponent(s.world.getComponent(PositionComponentID));

    (uint256 targetEntity, bool foundTargetEntity) = getEntityAt(s.world, position);

    require(!foundTargetEntity, "spot taken fool!");

    uint256 entity = s.world.getUniqueEntityId();

    entityTypeComponent.set(entity, entityType);
    positionComponent.set(entity, position);

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

    (uint256 targetEntity, bool foundTargetEntity) = getEntityWithAt(s.world, UntraversableComponentID, targetPosition);
    if (!foundTargetEntity) {
      return positionComponent.set(entity, targetPosition);
    }

    revert("Invalid action");
  }

  // Entry Points. Debugging only
  function entryPoint() public populateCallerEntityID {}
}
