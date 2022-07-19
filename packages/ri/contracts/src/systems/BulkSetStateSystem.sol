// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { getAddressById, getSystemAddressById } from "solecs/utils.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "./ComponentDevSystem.sol";
import { PrototypeDevSystem, ID as PrototypeDevSystemID } from "./PrototypeDevSystem.sol";

uint256 constant ID = uint256(keccak256("mudwar.system.BulkSetState"));

struct ECSEvent {
  uint8 component;
  uint32 entity;
  bytes value;
}

contract BulkSetStateSystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function requirement(bytes memory) public view returns (bytes memory) {
    // NOTE: Make sure to not include this system in a production deployment, as anyone can cahnge all component values
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256[] memory componentIds, uint256[] memory entities, ECSEvent[] memory state) = abi.decode(
      arguments,
      (uint256[], uint256[], ECSEvent[])
    );

    ComponentDevSystem componentDevSystem = ComponentDevSystem(getSystemAddressById(components, ComponentDevSystemID));
    PrototypeDevSystem prototypeDevSystem = PrototypeDevSystem(getSystemAddressById(components, PrototypeDevSystemID));

    for (uint256 i; i < state.length; i++) {
      if (componentIds[state[i].component] == 0) {
        prototypeDevSystem.executeTyped(abi.decode(state[i].value, (uint256)), entities[state[i].entity]);
      } else {
        componentDevSystem.executeTyped(componentIds[state[i].component], entities[state[i].entity], state[i].value);
      }
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
