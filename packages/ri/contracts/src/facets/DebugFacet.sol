// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";
import { UsingDiamondOwner } from "../diamond/utils/UsingDiamondOwner.sol";
import { UsingAccessControl } from "../access/UsingAccessControl.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";

struct ECSEvent {
  uint8 component;
  uint32 entity;
  bytes value;
}

contract DebugFacet is UsingDiamondOwner, UsingAccessControl {
  AppStorage internal s;

  function callerEntityID() external view returns (uint256) {
    return s._callerEntityID;
  }

  function addComponentToEntityExternally(
    uint256 entity,
    uint256 componentId,
    bytes memory value
  ) public {
    Component c = Component(s.world.getComponent(componentId));
    c.set(entity, value);
  }

  function removeComponentFromEntityExternally(uint256 entity, uint256 componentId) external {
    Component c = Component(s.world.getComponent(componentId));
    c.remove(entity);
  }

  function bulkSetState(
    uint256[] memory components,
    uint256[] memory entities,
    ECSEvent[] memory state
  ) external {
    for (uint256 i; i < state.length; i++) {
      addComponentToEntityExternally(entities[state[i].entity], components[state[i].component], state[i].value);
    }
  }

  function entryPoint() public populateCallerEntityID {}
}
