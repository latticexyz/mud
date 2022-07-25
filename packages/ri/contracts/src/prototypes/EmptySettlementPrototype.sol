// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibPrototype } from "../libraries/LibPrototype.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { StructureTypeComponent, ID as StructureTypeComponentID } from "../components/StructureTypeComponent.sol";
import { StaminaComponent, Stamina, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { CombatComponent, Combat, ID as CombatComponentID } from "../components/CombatComponent.sol";
import { FactoryComponent, Factory, ID as FactoryComponentID } from "../components/FactoryComponent.sol";
import { CapturableComponent, ID as CapturableComponentID } from "../components/CapturableComponent.sol";
import { SpawnPointComponent, ID as SpawnPointComponentID } from "../components/SpawnPointComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";

import { StructureTypes, ItemTypes, CombatTypes } from "../utils/Types.sol";

import { ID as SoldierID } from "./SoldierPrototype.sol";
import { ID as DonkeyID } from "./DonkeyPrototype.sol";
import { ID as SpearID } from "./SpearPrototype.sol";
import { ID as ArcherID } from "./ArcherPrototype.sol";
import { ID as CavalryID } from "./CavalryPrototype.sol";

uint256 constant ID = uint256(keccak256("mudwar.prototype.EmptySettlement"));

function EmptySettlementPrototype(IUint256Component components) {
  StructureTypeComponent(getAddressById(components, StructureTypeComponentID)).set(
    ID,
    uint32(StructureTypes.Settlement)
  );
  StaminaComponent(getAddressById(components, StaminaComponentID)).set(
    ID,
    Stamina({ current: 0, max: 6, regeneration: 1 })
  );
  CombatComponent(getAddressById(components, CombatComponentID)).set(
    ID,
    Combat({ _type: uint32(CombatTypes.Passive), strength: 25_000, health: 100_000, passive: false })
  );
  CapturableComponent(getAddressById(components, CapturableComponentID)).set(ID);
  UntraversableComponent(getAddressById(components, UntraversableComponentID)).set(ID);
  InventoryComponent(getAddressById(components, InventoryComponentID)).set(ID, uint32(10));

  uint256[] memory prototypeIds = new uint256[](5);
  prototypeIds[0] = DonkeyID;
  prototypeIds[1] = SoldierID;
  prototypeIds[2] = SpearID;
  prototypeIds[3] = ArcherID;
  prototypeIds[4] = CavalryID;

  int32[] memory costs = new int32[](5);
  costs[0] = 1;
  costs[1] = 2;
  costs[2] = 2;
  costs[3] = 2;
  costs[4] = 3;

  uint32[] memory costItemTypes = new uint32[](5);
  costItemTypes[0] = uint32(ItemTypes.Gold);
  costItemTypes[1] = uint32(ItemTypes.Gold);
  costItemTypes[2] = uint32(ItemTypes.Gold);
  costItemTypes[3] = uint32(ItemTypes.Gold);
  costItemTypes[4] = uint32(ItemTypes.Gold);

  FactoryComponent(getAddressById(components, FactoryComponentID)).set(ID, Factory(prototypeIds, costs, costItemTypes));

  SpawnPointComponent(getAddressById(components, SpawnPointComponentID)).set(ID);

  uint256[] memory componentIds = new uint256[](8);
  componentIds[0] = StructureTypeComponentID;
  componentIds[1] = StaminaComponentID;
  componentIds[2] = CombatComponentID;
  componentIds[3] = FactoryComponentID;
  componentIds[4] = CapturableComponentID;
  componentIds[5] = SpawnPointComponentID;
  componentIds[6] = UntraversableComponentID;
  componentIds[7] = InventoryComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
