// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { IWorld } from "solecs/interfaces/IWorld.sol";

import { LibPrototype } from "../libraries/LibPrototype.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { StructureTypeComponent, ID as StructureTypeComponentID } from "../components/StructureTypeComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";

import { StructureTypes } from "../utils/Types.sol";

import { ID as EmberCrownID } from "./EmberCrownPrototype.sol";

uint256 constant ID = uint256(keccak256("mudwar.prototype.EmberCrownContainer"));

function EmberCrownContainerPrototype(IUint256Component components, IWorld world) {
  InventoryComponent(getAddressById(components, InventoryComponentID)).set(ID, uint32(1));
  StructureTypeComponent(getAddressById(components, StructureTypeComponentID)).set(
    ID,
    uint32(StructureTypes.Container)
  );
  UntraversableComponent(getAddressById(components, UntraversableComponentID)).set(ID);

  uint256[] memory componentIds = new uint256[](3);
  componentIds[0] = InventoryComponentID;
  componentIds[1] = StructureTypeComponentID;
  componentIds[2] = UntraversableComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);

  LibPrototype.createPrototypeFromPrototype(components, world, EmberCrownID, ID);
}
