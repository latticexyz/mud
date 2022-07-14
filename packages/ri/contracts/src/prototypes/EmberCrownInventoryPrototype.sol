// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { IWorld } from "solecs/interfaces/IWorld.sol";

import { LibPrototype } from "../libraries/LibPrototype.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { ItemTypeComponent, ID as ItemTypeComponentID } from "../components/ItemTypeComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";

import { ID as EmberCrownID } from "./EmberCrownPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.prototype.emberCrownInventory"));

function EmberCrownInventoryPrototype(IUint256Component components, IWorld world) {
  InventoryComponent(getAddressById(components, InventoryComponentID)).set(ID, int32(3));
  ItemTypeComponent(getAddressById(components, ItemTypeComponentID)).set(ID, uint32(0));

  uint256[] memory componentIds = new uint256[](2);
  componentIds[0] = InventoryComponentID;
  componentIds[1] = ItemTypeComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);

  LibPrototype.createPrototypeFromPrototype(components, world, EmberCrownID, ID);
}
