// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibECS } from "../libraries/LibECS.sol";
import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";
import { LibInventory } from "../libraries/LibInventory.sol";
import { LibQuery } from "solecs/LibQuery.sol";

import { QueryFragment, QueryType } from "solecs/interfaces/Query.sol";

import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { StaminaComponent, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";
import { StructureTypeComponent, ID as StructureTypeComponentID } from "../components/StructureTypeComponent.sol";

import { StructureTypes } from "../utils/Types.sol";

uint256 constant ID = uint256(keccak256("ember.system.TransferInventory"));

contract TransferInventorySystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    (uint256 inventoryOwnerEntity, uint256 receiverEntity) = abi.decode(arguments, (uint256, uint256));

    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    require(
      !ownedByComponent.has(inventoryOwnerEntity) || LibECS.isOwnedByCaller(components, inventoryOwnerEntity),
      "this inventory is owned and not by you, bloody thief!"
    );
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));

    require(
      LibUtils.manhattan(
        positionComponent.getValue(inventoryOwnerEntity),
        positionComponent.getValue(receiverEntity)
      ) <= 1,
      "owner and receiver too far away"
    );

    require(
      LibInventory.getItems(components, inventoryOwnerEntity).length > 0,
      "owner needs to have at least one item"
    );

    uint32 spaceLeft = LibInventory.requireHasSpace(components, receiverEntity);

    return abi.encode(inventoryOwnerEntity, receiverEntity, spaceLeft, ownedByComponent, positionComponent);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (
      uint256 inventoryOwnerEntity,
      uint256 receiverEntity,
      uint32 spaceLeft,
      OwnedByComponent ownedByComponent,
      PositionComponent positionComponent
    ) = abi.decode(requirement(arguments), (uint256, uint256, uint32, OwnedByComponent, PositionComponent));
    uint256[] memory ownedItems = LibInventory.getItems(components, inventoryOwnerEntity);

    for (uint256 i = 0; i < ownedItems.length && uint32(i) < spaceLeft; i++) {
      ownedByComponent.set(ownedItems[i], receiverEntity);
    }

    StructureTypeComponent structureTypeComponent = StructureTypeComponent(
      getAddressById(components, StructureTypeComponentID)
    );
    if (ownedItems.length <= spaceLeft && structureTypeComponent.has(inventoryOwnerEntity)) {
      positionComponent.remove(inventoryOwnerEntity);
      structureTypeComponent.remove(inventoryOwnerEntity);
      InventoryComponent(getAddressById(components, InventoryComponentID)).remove(inventoryOwnerEntity);
    }

    LibStamina.modifyStamina(components, receiverEntity, -1);
  }

  function requirementTyped(uint256 inventoryOwnerEntity, uint256 receiverEntity) public view returns (bytes memory) {
    return requirement(abi.encode(inventoryOwnerEntity, receiverEntity));
  }

  function executeTyped(uint256 inventoryOwnerEntity, uint256 receiverEntity) public returns (bytes memory) {
    return execute(abi.encode(inventoryOwnerEntity, receiverEntity));
  }
}
