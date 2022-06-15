// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { PositionComponent, ID as PositionComponentID, Position } from "../components/PositionComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID, EntityType } from "../components/EntityTypeComponent.sol";
import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";
import { UsingDiamondOwner } from "../diamond/utils/UsingDiamondOwner.sol";
import { UsingAccessControl } from "../access/UsingAccessControl.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";

struct ECSEvent {
  uint256 componentId;
  uint256 entity;
  bytes value;
}

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
  ) public {
    Component c = Component(s.world.getComponent(componentId));
    c.set(entity, value);
  }

  // Debugging
  function removeComponentFromEntityExternally(uint256 entity, uint256 componentId) external {
    Component c = Component(s.world.getComponent(componentId));
    c.remove(entity);
  }

  function bulkSetState(ECSEvent[] memory state) external {
    for (uint256 i; i < state.length; i++) {
      addComponentToEntityExternally(state[i].entity, state[i].componentId, state[i].value);
    }
  }

  function spawnCreature(Position calldata position) external {
    EntityTypeComponent entityTypeComponent = EntityTypeComponent(s.world.getComponent(EntityTypeComponentID));
    PositionComponent positionComponent = PositionComponent(s.world.getComponent(PositionComponentID));

    uint256 entity = s.world.getUniqueEntityId();

    entityTypeComponent.set(entity, EntityType({ entityType: 0 }));
    positionComponent.set(entity, position);
  }

  // Entry Points. Debugging only
  function entryPoint() public populateCallerEntityID {}
}
