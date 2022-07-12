// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibPrototype } from "../libraries/LibPrototype.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { StaminaComponent, Stamina, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { ResourceGeneratorComponent, ID as ResourceGeneratorComponentID } from "../components/ResourceGeneratorComponent.sol";

import { ID as GoldID } from "./GoldPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.prototype.goldShrine"));

function GoldShrinePrototype(IUint256Component components) {
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(ID, uint32(9));
  StaminaComponent(getAddressById(components, StaminaComponentID)).set(
    ID,
    Stamina({ current: 0, max: 6, regeneration: 1 })
  );
  ResourceGeneratorComponent(getAddressById(components, ResourceGeneratorComponentID)).set(ID, GoldID);

  uint256[] memory componentIds = new uint256[](3);
  componentIds[0] = EntityTypeComponentID;
  componentIds[1] = StaminaComponentID;
  componentIds[2] = ResourceGeneratorComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
