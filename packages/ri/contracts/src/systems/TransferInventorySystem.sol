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

uint256 constant ID = uint256(keccak256("ember.system.TransferInventory"));

contract TransferInventorySystem is ISystem {
  IUint256Component components;

  constructor(IUint256Component _components, IWorld) {
    components = _components;
  }

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    (uint256 giverInventory, uint256 receiverInventory) = abi.decode(arguments, (uint256, uint256));

    require(
      LibECS.isOwnedByCaller(OwnedByComponent(getAddressById(components, OwnedByComponentID)), giverInventory),
      "you don't own this entity"
    );

    require(
      LibUtils.manhattan(
        LibInventory.getInventoryPosition(components, giverInventory),
        LibInventory.getInventoryPosition(components, receiverInventory)
      ) <= 1,
      "giver and receiver too far away"
    );

    require(LibInventory.getItems(components, giverInventory).length > 0, "giver needs to have at least one item");

    int32 spaceLeft = LibInventory.requireHasSpace(components, receiverInventory);

    return abi.encode(giverInventory, receiverInventory, spaceLeft);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 giverInventory, uint256 receiverInventory, int32 spaceLeft) = abi.decode(
      requirement(arguments),
      (uint256, uint256, int32)
    );
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    uint256[] memory giverItems = LibInventory.getItems(components, giverInventory);
    for (uint256 i = 0; i < giverItems.length && i < uint32(spaceLeft); i++) {
      ownedByComponent.set(giverItems[i], receiverInventory);
    }

    LibStamina.modifyStamina(components, ownedByComponent.getValue(giverInventory), -1);
  }

  function requirementTyped(uint256 giverInventory, uint256 receiverInventory) public view returns (bytes memory) {
    return requirement(abi.encode(giverInventory, receiverInventory));
  }

  function executeTyped(uint256 giverInventory, uint256 receiverInventory) public returns (bytes memory) {
    return execute(abi.encode(giverInventory, receiverInventory));
  }
}
