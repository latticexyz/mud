// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { System } from "solecs/System.sol";
import { getAddressById } from "solecs/utils.sol";

uint256 constant ID = uint256(keccak256("lib.testSystem"));

/// @dev Sets values of `entities` to `newValues` for the component with `componentId`
contract TestSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function execute(bytes memory args) public returns (bytes memory) {
    (uint256 componentId, uint256[] memory entities, bytes[] memory newValues) = abi.decode(
      args,
      (uint256, uint256[], bytes[])
    );

    IComponent comp = IComponent(getAddressById(components, componentId));

    for (uint256 i; i < entities.length; i++) {
      uint256 entity = entities[i];
      bytes memory newValue = newValues[i];
      comp.set(entity, newValue);
    }
    return "";
  }

  function executeTyped(
    uint256 componentId,
    uint256[] memory entities,
    bytes[] memory newValues
  ) public {
    execute(abi.encode(componentId, entities, newValues));
  }
}
