// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibPrototype } from "../libraries/LibPrototype.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { StructureTypeComponent, ID as StructureTypeComponentID } from "../components/StructureTypeComponent.sol";
import { StaminaComponent, Stamina, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { ResourceGeneratorComponent, ID as ResourceGeneratorComponentID } from "../components/ResourceGeneratorComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";

import { StructureTypes } from "../utils/Types.sol";

import { ID as GoldID } from "./GoldPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.prototype.goldShrine"));

function GoldShrinePrototype(IUint256Component components) {
  StructureTypeComponent(getAddressById(components, StructureTypeComponentID)).set(
    ID,
    uint32(StructureTypes.GoldShrine)
  );
  StaminaComponent(getAddressById(components, StaminaComponentID)).set(
    ID,
    Stamina({ current: 0, max: 6, regeneration: 1 })
  );
  LastActionTurnComponent(getAddressById(components, LastActionTurnComponentID)).set(ID, 0);
  ResourceGeneratorComponent(getAddressById(components, ResourceGeneratorComponentID)).set(ID, GoldID);
  UntraversableComponent(getAddressById(components, UntraversableComponentID)).set(ID);

  uint256[] memory componentIds = new uint256[](5);
  componentIds[0] = StructureTypeComponentID;
  componentIds[1] = StaminaComponentID;
  componentIds[2] = ResourceGeneratorComponentID;
  componentIds[3] = LastActionTurnComponentID;
  componentIds[4] = UntraversableComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
