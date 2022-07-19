// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibPrototype } from "../libraries/LibPrototype.sol";

import { PrototypeComponent, ID as PrototypeComponentID } from "../components/PrototypeComponent.sol";
import { UnitTypeComponent, ID as UnitTypeComponentID } from "../components/UnitTypeComponent.sol";
import { MovableComponent, ID as MovableComponentID } from "../components/MovableComponent.sol";
import { StaminaComponent, Stamina, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { LastActionTurnComponent, ID as LastActionTurnComponentID } from "../components/LastActionTurnComponent.sol";
import { HealthComponent, Health, ID as HealthComponentID } from "../components/HealthComponent.sol";
import { AttackComponent, Attack, ID as AttackComponentID } from "../components/AttackComponent.sol";
import { UntraversableComponent, ID as UntraversableComponentID } from "../components/UntraversableComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";

import { UnitTypes } from "../utils/Types.sol";

uint256 constant ID = uint256(keccak256("mudwar.prototype.Guard"));

function GuardPrototype(IUint256Component components) {
  UnitTypeComponent(getAddressById(components, UnitTypeComponentID)).set(ID, uint32(UnitTypes.Soldier));
  StaminaComponent(getAddressById(components, StaminaComponentID)).set(
    ID,
    Stamina({ current: 0, max: 3, regeneration: 1 })
  );
  HealthComponent(getAddressById(components, HealthComponentID)).set(ID, Health({ current: 100_000, max: 100_000 }));
  AttackComponent(getAddressById(components, AttackComponentID)).set(ID, Attack({ strength: 120_000, range: 1 }));
  MovableComponent(getAddressById(components, MovableComponentID)).set(ID, int32(0));
  UntraversableComponent(getAddressById(components, UntraversableComponentID)).set(ID);
  LastActionTurnComponent(getAddressById(components, LastActionTurnComponentID)).set(ID, 0);
  InventoryComponent(getAddressById(components, InventoryComponentID)).set(ID, uint32(3));

  uint256[] memory componentIds = new uint256[](8);
  componentIds[0] = UnitTypeComponentID;
  componentIds[1] = StaminaComponentID;
  componentIds[2] = MovableComponentID;
  componentIds[3] = HealthComponentID;
  componentIds[4] = AttackComponentID;
  componentIds[5] = UntraversableComponentID;
  componentIds[6] = LastActionTurnComponentID;
  componentIds[7] = InventoryComponentID;

  PrototypeComponent(getAddressById(components, PrototypeComponentID)).set(ID, componentIds);
}
