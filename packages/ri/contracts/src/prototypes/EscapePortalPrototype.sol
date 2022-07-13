// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { EscapePortalComponent, ID as EscapePortalComponentID } from "../components/EscapePortalComponent.sol";

uint256 constant ID = uint256(keccak256("ember.prototype.escapePortal"));

function EscapePortalPrototype(IUint256Component components) {
  EscapePortalComponent(getAddressById(components, EscapePortalComponentID)).set(ID);
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(ID, uint32(9));

  uint256[] memory componentIds = new uint256[](2);
  componentIds[0] = EscapePortalComponentID;
  componentIds[1] = EntityTypeComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
