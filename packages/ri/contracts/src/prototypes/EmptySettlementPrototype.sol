// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibPrototype } from "../libraries/LibPrototype.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { StaminaComponent, Stamina, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";
import { HealthComponent, Health, ID as HealthComponentID } from "../components/HealthComponent.sol";
import { AttackComponent, Attack, ID as AttackComponentID } from "../components/AttackComponent.sol";
import { FactoryComponent, Factory, ID as FactoryComponentID } from "../components/FactoryComponent.sol";
import { CapturableComponent, ID as CapturableComponentID } from "../components/CapturableComponent.sol";
import { SpawnPointComponent, ID as SpawnPointComponentID } from "../components/SpawnPointComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";

import { ID as SoldierID } from "./SoldierPrototype.sol";
import { ID as InventoryID } from "./InventoryPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.prototype.emptySettlement"));

function EmptySettlementPrototype(IUint256Component components, IWorld world) {
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(ID, uint32(1));
  StaminaComponent(getAddressById(components, StaminaComponentID)).set(
    ID,
    Stamina({ current: 0, max: 20, regeneration: 1 })
  );
  HealthComponent(getAddressById(components, HealthComponentID)).set(ID, Health({ current: 100_000, max: 100_000 }));
  AttackComponent(getAddressById(components, AttackComponentID)).set(ID, Attack({ strength: 60_000, range: 1 }));
  CapturableComponent(getAddressById(components, CapturableComponentID)).set(ID);
  UntraversableComponent(getAddressById(components, UntraversableComponentID)).set(ID);

  uint256[] memory prototypeIds = new uint256[](1);
  prototypeIds[0] = SoldierID;

  int32[] memory costs = new int32[](1);
  costs[0] = 1;

  FactoryComponent(getAddressById(components, FactoryComponentID)).set(
    ID,
    Factory({ prototypeIds: prototypeIds, costs: costs })
  );

  SpawnPointComponent(getAddressById(components, SpawnPointComponentID)).set(ID);

  uint256[] memory componentIds = new uint256[](8);
  componentIds[0] = EntityTypeComponentID;
  componentIds[1] = StaminaComponentID;
  componentIds[2] = HealthComponentID;
  componentIds[3] = AttackComponentID;
  componentIds[4] = FactoryComponentID;
  componentIds[5] = CapturableComponentID;
  componentIds[6] = SpawnPointComponentID;
  componentIds[7] = UntraversableComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);

  uint256 inventoryEntity = LibPrototype.createPrototypeFromPrototype(components, world, InventoryID, ID);
  InventoryComponent(getAddressById(components, InventoryComponentID)).set(inventoryEntity, 10);
}
