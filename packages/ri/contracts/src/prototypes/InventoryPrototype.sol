// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";

uint256 constant ID = uint256(keccak256("ember.blueprint.inventory"));

function InventoryPrototype(IUint256Component components) {
  InventoryComponent(getAddressById(components, InventoryComponentID)).set(ID, int32(3));
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(ID, uint32(6));

  uint256[] memory componentIds = new uint256[](2);
  componentIds[0] = InventoryComponentID;
  componentIds[1] = EntityTypeComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
