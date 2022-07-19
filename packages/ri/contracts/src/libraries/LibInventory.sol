// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { QueryFragment, QueryType } from "solecs/interfaces/Query.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibECS } from "../libraries/LibECS.sol";

import { LibQuery } from "solecs/LibQuery.sol";

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibPrototype } from "../libraries/LibPrototype.sol";

import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";
import { ItemTypeComponent, ID as ItemTypeComponentID } from "../components/ItemTypeComponent.sol";
import { StructureTypeComponent, ID as StructureTypeComponentID } from "../components/StructureTypeComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";

import { ItemTypes, StructureTypes } from "../utils/Types.sol";

library LibInventory {
  function dropInventory(
    IUint256Component components,
    IWorld world,
    uint256 entity,
    Coord memory targetPosition
  ) internal {
    uint256[] memory items = LibInventory.getItems(components, entity);
    if (items.length == 0) return;

    uint256 containerEntity = createContainer(components, world, uint32(items.length));
    PositionComponent(getAddressById(components, PositionComponentID)).set(containerEntity, targetPosition);

    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    for (uint256 i = 0; i < items.length; i++) {
      ownedByComponent.set(items[i], containerEntity);
    }
  }

  function transferItem(
    IUint256Component components,
    uint256 itemEntity,
    uint256 receiverEntity
  ) internal {
    requireHasSpace(components, receiverEntity);

    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    ownedByComponent.set(itemEntity, receiverEntity);
  }

  function transferItems(
    IUint256Component components,
    uint256 giverEntity,
    uint256 receiverEntity
  ) internal {
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    uint32 capacity = InventoryComponent(getAddressById(components, InventoryComponentID)).getValue(receiverEntity);
    uint256[] memory giverItems = LibInventory.getItems(components, giverEntity);
    for (uint256 i = 0; i < giverItems.length && i < capacity; i++) {
      ownedByComponent.set(giverItems[i], receiverEntity);
    }
  }

  function getItems(IUint256Component components, uint256 entity) internal view returns (uint256[] memory) {
    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(
      QueryType.HasValue,
      OwnedByComponent(getAddressById(components, OwnedByComponentID)),
      abi.encode(entity)
    );
    fragments[1] = QueryFragment(
      QueryType.Has,
      ItemTypeComponent(getAddressById(components, ItemTypeComponentID)),
      new bytes(0)
    );
    return LibQuery.query(fragments);
  }

  function burnItem(IUint256Component components, uint256 itemEntity) internal {
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    ownedByComponent.remove(itemEntity);
  }

  function spawnItem(
    IUint256Component components,
    IWorld world,
    uint256 receiverEntity,
    uint256 prototypeId
  ) internal {
    requireHasSpace(components, receiverEntity);

    uint256 itemEntity = LibPrototype.copyPrototype(components, world, prototypeId);
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    ownedByComponent.set(itemEntity, receiverEntity);
  }

  function createContainer(
    IUint256Component components,
    IWorld world,
    uint32 capacity
  ) internal returns (uint256 containerEntity) {
    containerEntity = world.getUniqueEntityId();
    InventoryComponent(getAddressById(components, InventoryComponentID)).set(containerEntity, capacity);
    StructureTypeComponent(getAddressById(components, StructureTypeComponentID)).set(
      containerEntity,
      uint32(StructureTypes.Container)
    );
    UntraversableComponent(getAddressById(components, UntraversableComponentID)).set(containerEntity);
  }

  function requireHasSpace(IUint256Component components, uint256 entity) internal view returns (uint32) {
    uint256[] memory items = getItems(components, entity);
    uint32 spaceLeft = InventoryComponent(getAddressById(components, InventoryComponentID)).getValue(entity) -
      uint32(items.length);
    require(spaceLeft > 0, "inventory full");
    return spaceLeft;
  }
}
