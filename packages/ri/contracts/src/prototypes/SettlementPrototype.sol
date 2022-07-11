// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

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

import { ID as SoldierID } from "./SoldierPrototype.sol";

uint256 constant ID = uint256(keccak256("ember.prototype.settlement"));

function SettlementPrototype(IUint256Component components) {
  EntityTypeComponent(getAddressById(components, EntityTypeComponentID)).set(ID, uint32(5));
  StaminaComponent(getAddressById(components, StaminaComponentID)).set(
    ID,
    Stamina({ current: 0, max: 20, regeneration: 1 })
  );
  HealthComponent(getAddressById(components, HealthComponentID)).set(ID, Health({ current: 100_000, max: 100_000 }));
  AttackComponent(getAddressById(components, AttackComponentID)).set(ID, Attack({ strength: 60_000, range: 1 }));
  CapturableComponent(getAddressById(components, CapturableComponentID)).set(ID);

  uint256[] memory prototypeIds = new uint256[](1);
  prototypeIds[0] = SoldierID;

  int32[] memory costs = new int32[](1);
  costs[0] = 1;

  FactoryComponent(getAddressById(components, FactoryComponentID)).set(
    ID,
    Factory({ prototypeIds: prototypeIds, costs: costs })
  );

  uint256[] memory componentIds = new uint256[](6);
  componentIds[0] = EntityTypeComponentID;
  componentIds[1] = StaminaComponentID;
  componentIds[2] = HealthComponentID;
  componentIds[3] = AttackComponentID;
  componentIds[4] = FactoryComponentID;
  componentIds[5] = CapturableComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
