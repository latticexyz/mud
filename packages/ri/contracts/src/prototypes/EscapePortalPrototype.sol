// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { StructureTypeComponent, ID as StructureTypeComponentID } from "../components/StructureTypeComponent.sol";
import { EscapePortalComponent, ID as EscapePortalComponentID } from "../components/EscapePortalComponent.sol";

uint256 constant ID = uint256(keccak256("ember.prototype.escapePortal"));

function EscapePortalPrototype(IUint256Component components) {
  EscapePortalComponent(getAddressById(components, EscapePortalComponentID)).set(ID);
  StructureTypeComponent(getAddressById(components, StructureTypeComponentID)).set(ID, uint32(2));

  uint256[] memory componentIds = new uint256[](2);
  componentIds[0] = EscapePortalComponentID;
  componentIds[1] = StructureTypeComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
