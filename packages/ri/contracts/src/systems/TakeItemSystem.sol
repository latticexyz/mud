// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { ISystem } from "solecs/interfaces/ISystem.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibECS } from "std-contracts/libraries/LibECS.sol";

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";
import { LibQuery } from "solecs/LibQuery.sol";

import { QueryFragment, QueryType } from "solecs/interfaces/Query.sol";

import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { StaminaComponent, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";

uint256 constant ID = uint256(keccak256("ember.system.takeItem"));

contract TakeItemSystem is ISystem {
  IUint256Component components;

  constructor(IUint256Component _components, IWorld) {
    components = _components;
  }

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    (uint256 takerEntity, uint256 takerInventoryEntity, uint256 itemEntity, uint256 itemInventoryEntity) = abi.decode(
      arguments,
      (uint256, uint256, uint256, uint256)
    );

    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    require(LibECS.isOwnedByCaller(ownedByComponent, takerEntity), "you don't own this entity");

    require(
      ownedByComponent.getValue(takerInventoryEntity) == takerEntity,
      "taker entity does not own taker inventory entity"
    );
    require(
      ownedByComponent.getValue(itemEntity) == itemInventoryEntity,
      "item entity not owned by item inventory entity"
    );

    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));

    require(
      positionComponent.has(itemInventoryEntity),
      "item inventory entity doesn't have a position, can't be taken from"
    );
    require(
      LibUtils.manhattan(positionComponent.getValue(takerEntity), positionComponent.getValue(itemInventoryEntity)) <= 1,
      "taker entity is too far from item inventory entity"
    );

    InventoryComponent inventoryComponent = InventoryComponent(getAddressById(components, InventoryComponentID));

    require(
      int32(uint32(ownedByComponent.getEntitiesWithValue(takerInventoryEntity).length)) <
        inventoryComponent.getValue(takerInventoryEntity),
      "inventory full"
    );

    return
      abi.encode(
        takerEntity,
        takerInventoryEntity,
        itemEntity,
        itemInventoryEntity,
        ownedByComponent,
        positionComponent
      );
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (
      uint256 takerEntity,
      uint256 takerInventoryEntity,
      uint256 itemEntity,
      uint256 itemInventoryEntity,
      OwnedByComponent ownedByComponent,
      PositionComponent positionComponent
    ) = abi.decode(requirement(arguments), (uint256, uint256, uint256, uint256, OwnedByComponent, PositionComponent));

    ownedByComponent.set(itemEntity, takerInventoryEntity);

    uint256[] memory ents = ownedByComponent.getEntitiesWithValue(itemInventoryEntity);

    uint256 entlen = ents.length;
    if (entlen == 0) {
      // delete this inventory if its empty
      positionComponent.remove(itemInventoryEntity);
    }

    LibStamina.modifyStamina(components, takerEntity, -1);
  }

  function requirementTyped(
    uint256 takerEntity,
    uint256 takerInventoryEntity,
    uint256 itemEntity,
    uint256 itemInventoryEntity
  ) public view returns (bytes memory) {
    return requirement(abi.encode(takerEntity, takerInventoryEntity, itemEntity, itemInventoryEntity));
  }

  function executeTyped(
    uint256 takerEntity,
    uint256 takerInventoryEntity,
    uint256 itemEntity,
    uint256 itemInventoryEntity
  ) public returns (bytes memory) {
    return execute(abi.encode(takerEntity, takerInventoryEntity, itemEntity, itemInventoryEntity));
  }
}
