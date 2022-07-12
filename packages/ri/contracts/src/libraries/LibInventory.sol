// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { QueryFragment, QueryType } from "solecs/interfaces/Query.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibECS } from "std-contracts/libraries/LibECS.sol";

import { LibQuery } from "solecs/LibQuery.sol";

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibPrototype } from "../libraries/LibPrototype.sol";

import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";
import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";

library LibInventory {
  function dropInventory(
    IUint256Component components,
    uint256 inventoryEntity,
    Coord memory targetPosition
  ) internal {
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    ownedByComponent.remove(inventoryEntity);

    if (ownedByComponent.getEntitiesWithValue(inventoryEntity).length > 0) {
      PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
      positionComponent.set(inventoryEntity, targetPosition);
    }
  }

  function getInventory(IUint256Component components, uint256 ownerEntity) internal view returns (uint256) {
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    InventoryComponent inventoryComponent = InventoryComponent(getAddressById(components, InventoryComponentID));

    QueryFragment[] memory fragments = new QueryFragment[](2);
    fragments[0] = QueryFragment(QueryType.HasValue, ownedByComponent, abi.encode(ownerEntity));
    fragments[1] = QueryFragment(QueryType.Has, inventoryComponent, new bytes(0));
    uint256[] memory inventoryEntities = LibQuery.query(fragments);

    require(inventoryEntities.length == 1, "inventory not found");

    return inventoryEntities[0];
  }

  function transferItem(
    IUint256Component components,
    uint256 itemEntity,
    uint256 receiverInventoryEntity
  ) internal {
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    ownedByComponent.set(itemEntity, receiverInventoryEntity);
  }

  function getItems(IUint256Component components, uint256 inventoryId) internal view returns (uint256[] memory items) {
    items = OwnedByComponent(getAddressById(components, OwnedByComponentID)).getEntitiesWithValue(inventoryId);
  }

  function burnItem(IUint256Component components, uint256 itemEntity) internal {
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    ownedByComponent.remove(itemEntity);
  }

  function spawnItem(
    IUint256Component components,
    IWorld world,
    uint256 prototypeId,
    uint256 receiverInventoryEntity
  ) internal {
    uint256 itemEntity = LibPrototype.copyPrototype(components, world, prototypeId);
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    ownedByComponent.set(itemEntity, receiverInventoryEntity);
  }
}
