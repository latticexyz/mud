// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById, getSystemAddressById } from "solecs/utils.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "./ComponentDevSystem.sol";

uint256 constant ID = uint256(keccak256("ember.system.bulkSetStateSystem"));

struct ECSEvent {
  uint8 component;
  uint32 entity;
  bytes value;
}

contract BulkSetStateSystem is ISystem {
  IUint256Component components;
  IWorld world;

  constructor(IUint256Component _components, IWorld _world) {
    components = _components;
    world = _world;
  }

  function requirement(bytes memory) public view returns (bytes memory) {
    // NOTE: Make sure to not include this system in a production deployment, as anyone can cahnge all component values
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256[] memory componentIds, uint256[] memory entities, ECSEvent[] memory state) = abi.decode(
      arguments,
      (uint256[], uint256[], ECSEvent[])
    );

    ComponentDevSystem componentDevSystem = ComponentDevSystem(getSystemAddressById(components, ComponentDevSystemID));

    for (uint256 i; i < state.length; i++) {
      componentDevSystem.executeTyped(componentIds[state[i].component], entities[state[i].entity], state[i].value);
    }
  }

  function executeTyped(
    uint256[] memory componentIds,
    uint256[] memory entities,
    ECSEvent[] memory state
  ) external returns (bytes memory) {
    return execute(abi.encode(componentIds, entities, state));
  }
}
