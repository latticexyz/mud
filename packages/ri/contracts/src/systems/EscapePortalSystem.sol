// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";

import { IComponent } from "solecs/interfaces/IComponent.sol";
import { getAddressById } from "solecs/utils.sol";
import { QueryFragment, QueryType } from "solecs/interfaces/Query.sol";
import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";
import { LibQuery } from "solecs/LibQuery.sol";

import { LibECS } from "../libraries/LibECS.sol";
import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";
import { LibInventory } from "../libraries/LibInventory.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { WinnerComponent, ID as WinnerComponentID } from "../components/WinnerComponent.sol";
import { EscapePortalComponent, ID as EscapePortalComponentID } from "../components/EscapePortalComponent.sol";
import { ItemTypeComponent, ID as ItemTypeComponentID } from "../components/ItemTypeComponent.sol";
import { PlayerComponent, ID as PlayerComponentID } from "../components/PlayerComponent.sol";

import { ItemTypes } from "../utils/Types.sol";

uint256 constant ID = uint256(keccak256("mudwar.system.EscapePortal"));

contract EscapePortalSystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    (uint256 entity, uint256 escapePortalEntity) = abi.decode(arguments, (uint256, uint256));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    EscapePortalComponent escapePortalComponent = EscapePortalComponent(
      getAddressById(components, EscapePortalComponentID)
    );

    require(LibECS.isOwnedByCaller(components, entity), "you don't own this entity");
    require(
      LibUtils.manhattan(positionComponent.getValue(entity), positionComponent.getValue(escapePortalEntity)) <= 1,
      "not close enough to escapePortal"
    );
    require(escapePortalComponent.getValue(escapePortalEntity) == true, "not a escapePortal!");

    return abi.encode(entity, positionComponent);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 entity, PositionComponent positionComponent) = abi.decode(
      requirement(arguments),
      (uint256, PositionComponent)
    );

    uint256[] memory items = LibInventory.getItems(components, entity);

    ItemTypeComponent itemTypeComponent = ItemTypeComponent(getAddressById(components, ItemTypeComponentID));
    for (uint256 i = 0; i < items.length; i++) {
      uint256 item = items[i];
      if (itemTypeComponent.getValue(item) == uint32(ItemTypes.EmberCrown)) {
        WinnerComponent winnerComponent = WinnerComponent(getAddressById(components, WinnerComponentID));
        winnerComponent.set(entity);
        endGame(); // lol
      }
    }

    //TODO: add logic to 'store' the items of the entity when escapePortaling out of the game

    positionComponent.remove(entity);
  }

  function endGame() private {
    PlayerComponent playerComponent = PlayerComponent(getAddressById(components, PlayerComponentID));
    uint256[] memory playerEntities = playerComponent.getEntitiesWithValue(true);
    for (uint256 i = 0; i < playerEntities.length; i++) {
      uint256 player = playerEntities[i];
      playerComponent.remove(player);
    }
  }

  function requirementTyped(uint256 entity, uint256 escapePortalEntity) public view returns (bytes memory) {
    return requirement(abi.encode(entity, escapePortalEntity));
  }

  function executeTyped(uint256 entity, uint256 escapePortalEntity) public returns (bytes memory) {
    return execute(abi.encode(entity, escapePortalEntity));
  }
}
