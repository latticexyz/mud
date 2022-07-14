// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { ItemTypeComponent, ID as ItemTypeComponentID } from "../components/ItemTypeComponent.sol";
import { EmberCrownComponent, ID as EmberCrownComponentID } from "../components/EmberCrownComponent.sol";

uint256 constant ID = uint256(keccak256("ember.prototype.emberCrown"));

function EmberCrownPrototype(IUint256Component components) {
  EmberCrownComponent(getAddressById(components, EmberCrownComponentID)).set(ID);
  ItemTypeComponent(getAddressById(components, ItemTypeComponentID)).set(ID, uint32(2));

  uint256[] memory componentIds = new uint256[](2);
  componentIds[0] = EmberCrownComponentID;
  componentIds[1] = ItemTypeComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
