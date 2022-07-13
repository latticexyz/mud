// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { EmberCrownComponent, ID as EmberCrownComponentID } from "../components/EmberCrownComponent.sol";

uint256 constant ID = uint256(keccak256("ember.prototype.emberCrown"));

function EmberCrownPrototype(IUint256Component components) {
  EmberCrownComponent(getAddressById(components, EmberCrownComponentID)).set(ID);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(ID, uint32(5));

  uint256[] memory componentIds = new uint256[](2);
  componentIds[0] = EmberCrownComponentID;
  componentIds[1] = EntityTypeComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
