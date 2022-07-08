// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { LibECS } from "../libraries/LibECS.sol";
import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";

import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";
import { UsingDiamondOwner } from "../diamond/utils/UsingDiamondOwner.sol";
import { UsingAccessControl } from "../access/UsingAccessControl.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";

contract MoveFacet is UsingDiamondOwner, UsingAccessControl {
  AppStorage internal s;

  function moveEntity(uint256 entity, Coord[] calldata path) external populateCallerEntityID {
    require(LibECS.doesCallerEntityIDOwnEntity(entity), "You don't own this entity");

    MovableComponent movableComponent = MovableComponent(s.world.getComponent(MovableComponentID));
    require(movableComponent.has(entity), "trying to move non-moving entity");
    require(movableComponent.getValue(entity) >= int32(uint32(path.length)), "not enough movespeed");

    PositionComponent positionComponent = PositionComponent(s.world.getComponent(PositionComponentID));
    Coord memory position = positionComponent.getValue(entity);
    for (uint256 i; i < path.length; i++) {
      Coord memory targetPosition = path[i];
      int32 distance = LibUtils.manhattan(position, targetPosition);
      require(distance <= 1, "not adjacent");

      (, bool foundTargetEntity) = LibUtils.getEntityWithAt(s.world, UntraversableComponentID, targetPosition);
      require(!foundTargetEntity, "entity blocking intended direction");
      position = targetPosition;
    }

    LibStamina.reduceStamina(entity, 1);
    positionComponent.set(entity, position);
  }
}
