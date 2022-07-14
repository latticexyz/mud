// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { ItemTypeComponent, ID as ItemTypeComponentID } from "../components/ItemTypeComponent.sol";
import { GoldComponent, ID as GoldComponentID } from "../components/GoldComponent.sol";

uint256 constant ID = uint256(keccak256("ember.prototype.gold"));

function GoldPrototype(IUint256Component components) {
  GoldComponent(getAddressById(components, GoldComponentID)).set(ID);
  ItemTypeComponent(getAddressById(components, ItemTypeComponentID)).set(ID, uint32(1));

  uint256[] memory componentIds = new uint256[](2);
  componentIds[0] = GoldComponentID;
  componentIds[1] = ItemTypeComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
