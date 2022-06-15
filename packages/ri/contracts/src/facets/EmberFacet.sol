// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { PositionComponent, ID as PositionComponentID, Position } from "../components/PositionComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID, EntityType } from "../components/EntityTypeComponent.sol";
import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";
import { UsingDiamondOwner } from "../diamond/utils/UsingDiamondOwner.sol";
import { UsingAccessControl } from "../access/UsingAccessControl.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";

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
    address component,
    bytes memory value
  ) external {
    Component c = Component(component);
    c.set(entity, value);
  }

  function removeComponentFromEntityExternally(uint256 entity, address component) external {
    Component c = Component(component);
    c.remove(entity);
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
