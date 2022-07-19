// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibECS } from "../libraries/LibECS.sol";

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";
import { LibInventory } from "../libraries/LibInventory.sol";
import { LibQuery } from "solecs/LibQuery.sol";
import { LibPrototype } from "../libraries/LibPrototype.sol";

import { QueryFragment, QueryType } from "solecs/interfaces/Query.sol";

import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";

uint256 constant ID = uint256(keccak256("ember.system.dropInventory"));

contract DropInventorySystem is ISystem {
  IUint256Component components;
  IWorld world;

  constructor(IUint256Component _components, IWorld _world) {
    components = _components;
    world = _world;
  }

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    (uint256 entity, Coord memory targetPosition) = abi.decode(arguments, (uint256, Coord));

    require(LibECS.isOwnedByCaller(components, entity), "you don't own this entity");

    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    require(LibUtils.manhattan(positionComponent.getValue(entity), targetPosition) <= 1, "not close enough");

    require(LibInventory.getItems(components, entity).length > 0, "no items to drop!");

    return abi.encode(entity, targetPosition);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 entity, Coord memory targetPosition) = abi.decode(requirement(arguments), (uint256, Coord));
    LibInventory.dropInventory(components, world, entity, targetPosition);
  }

  function requirementTyped(uint256 entity, Coord memory targetPosition) public view returns (bytes memory) {
    return requirement(abi.encode(entity, targetPosition));
  }

  function executeTyped(uint256 entity, Coord memory targetPosition) public returns (bytes memory) {
    return execute(abi.encode(entity, targetPosition));
  }
}
