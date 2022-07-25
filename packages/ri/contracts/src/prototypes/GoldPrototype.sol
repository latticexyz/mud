// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { ItemTypeComponent, ID as ItemTypeComponentID } from "../components/ItemTypeComponent.sol";

import { ItemTypes } from "../utils/Types.sol";

uint256 constant ID = uint256(keccak256("mudwar.prototype.Gold"));

function GoldPrototype(IUint256Component components) {
  ItemTypeComponent(getAddressById(components, ItemTypeComponentID)).set(ID, uint32(ItemTypes.Gold));

  uint256[] memory componentIds = new uint256[](1);
  componentIds[0] = ItemTypeComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
