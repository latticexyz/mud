// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibPrototype } from "../libraries/LibPrototype.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { StructureTypeComponent, ID as StructureTypeComponentID } from "../components/StructureTypeComponent.sol";
import { StaminaComponent, Stamina, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { HealthComponent, Health, ID as HealthComponentID } from "../components/HealthComponent.sol";
import { AttackComponent, Attack, ID as AttackComponentID } from "../components/AttackComponent.sol";
import { FactoryComponent, Factory, ID as FactoryComponentID } from "../components/FactoryComponent.sol";
import { CapturableComponent, ID as CapturableComponentID } from "../components/CapturableComponent.sol";
import { SpawnPointComponent, ID as SpawnPointComponentID } from "../components/SpawnPointComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";

import { StructureTypes, ItemTypes } from "../utils/Types.sol";

import { ID as SoldierID } from "./SoldierPrototype.sol";

uint256 constant ID = uint256(keccak256("mudwar.prototype.EmptySettlement"));

function EmptySettlementPrototype(IUint256Component components) {
  StructureTypeComponent(getAddressById(components, StructureTypeComponentID)).set(
    ID,
    uint32(StructureTypes.Settlement)
  );
  StaminaComponent(getAddressById(components, StaminaComponentID)).set(
    ID,
    Stamina({ current: 0, max: 20, regeneration: 1 })
  );
  HealthComponent(getAddressById(components, HealthComponentID)).set(ID, Health({ current: 100_000, max: 100_000 }));
  AttackComponent(getAddressById(components, AttackComponentID)).set(ID, Attack({ strength: 60_000, range: 1 }));
  CapturableComponent(getAddressById(components, CapturableComponentID)).set(ID);
  UntraversableComponent(getAddressById(components, UntraversableComponentID)).set(ID);
  InventoryComponent(getAddressById(components, InventoryComponentID)).set(ID, uint32(10));

  uint256[] memory prototypeIds = new uint256[](1);
  prototypeIds[0] = SoldierID;

  int32[] memory costs = new int32[](1);
  costs[0] = 1;

  uint32[] memory costItemTypes = new uint32[](1);
  costItemTypes[0] = uint32(ItemTypes.Gold);

  FactoryComponent(getAddressById(components, FactoryComponentID)).set(ID, Factory(prototypeIds, costs, costItemTypes));

  SpawnPointComponent(getAddressById(components, SpawnPointComponentID)).set(ID);

  uint256[] memory componentIds = new uint256[](9);
  componentIds[0] = StructureTypeComponentID;
  componentIds[1] = StaminaComponentID;
  componentIds[2] = HealthComponentID;
  componentIds[3] = AttackComponentID;
  componentIds[4] = FactoryComponentID;
  componentIds[5] = CapturableComponentID;
  componentIds[6] = SpawnPointComponentID;
  componentIds[7] = UntraversableComponentID;
  componentIds[8] = InventoryComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
