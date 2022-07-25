// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "solecs/System.sol";
import "solecs/Component.sol";
import "../libraries/ABDKMath64x64.sol";
import { QueryFragment, QueryType } from "solecs/interfaces/Query.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibECS } from "../libraries/LibECS.sol";
import { LibQuery } from "solecs/LibQuery.sol";

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";
import { LibInventory } from "../libraries/LibInventory.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { RangedCombatComponent, ID as RangedCombatComponentID, RangedCombat } from "../components/RangedCombatComponent.sol";
import { CombatComponent, ID as CombatComponentID, Combat } from "../components/CombatComponent.sol";
import { CombatStrengthComponent, ID as CombatStrengthComponentID, CombatStrength } from "../components/CombatStrengthComponent.sol";
import { CapturableComponent, ID as CapturableComponentID } from "../components/CapturableComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { StaminaComponent, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";

import { CombatTypes } from "../utils/Types.sol";

library LibCombat {
  function calculateStrengthDifference(
    IUint256Component components,
    uint32 attackerType,
    int32 attackerStrength,
    uint32 defenderType,
    int32 defenderStrength
  ) public view returns (int32) {
    CombatStrengthComponent combatStrengthComponent = CombatStrengthComponent(
      getAddressById(components, CombatStrengthComponentID)
    );

    uint256 attackStrengthId = uint256(keccak256(abi.encodePacked("mudwar.CombatStrength", attackerType)));
    int32 attackStrengthBonus = combatStrengthComponent.getValue(attackStrengthId).combatTypeStrengthBonuses[
      defenderType
    ];
    int32 attackStrength = attackerStrength + attackStrengthBonus;

    uint256 defenseStrengthId = uint256(keccak256(abi.encodePacked("mudwar.CombatStrength", defenderType)));
    int32 defenseStrengthBonus = combatStrengthComponent.getValue(defenseStrengthId).combatTypeStrengthBonuses[
      attackerType
    ];
    int32 defenseStrength = defenderStrength + defenseStrengthBonus;

    return attackStrength - defenseStrength;
  }

  function kill(
    IUint256Component components,
    IWorld world,
    uint256 entity
  ) public {
    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    Coord memory position = positionComponent.getValue(entity);
    if (positionComponent.has(entity)) {
      positionComponent.remove(entity);
    }

    CombatComponent combatComponent = CombatComponent(getAddressById(components, CombatComponentID));
    if (combatComponent.has(entity)) {
      combatComponent.remove(entity);
    }

    StaminaComponent staminaComponent = StaminaComponent(getAddressById(components, StaminaComponentID));
    if (staminaComponent.has(entity)) {
      staminaComponent.remove(entity);
    }

    if (InventoryComponent(getAddressById(components, InventoryComponentID)).has(entity)) {
      LibInventory.dropInventory(components, world, entity, position);
    }
  }

  function capture(
    IUint256Component components,
    uint256 attacker,
    uint256 defender
  ) public {
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    uint256 attackerOwner = LibECS.resolveRelationshipChain(ownedByComponent, attacker);
    ownedByComponent.set(defender, attackerOwner);

    CombatComponent combatComponent = CombatComponent(getAddressById(components, CombatComponentID));
    Combat memory defenderCombat = combatComponent.getValue(defender);
    defenderCombat.health = 100_000;
    combatComponent.set(defender, defenderCombat);
  }

  /**
   * damage = 30 * (e ** (0.04 * strengthDifference))
   * Calculate damage dealt as a function of the strength difference between attacker and defender.
   * If strength difference is 0, damage is 30_000.
   * For smaller strength differences (up to about 20_000) the expected difference in damage between two units is approximately linear at 2.5x the strength difference.
   * 30_000+ difference is a one-shot.
   */
  function calculateDamage(int32 strengthDifference) public pure returns (int64) {
    int128 strengthDifferenceAtClientPrecision = ABDKMath64x64.div(
      ABDKMath64x64.fromInt(strengthDifference),
      ABDKMath64x64.fromInt(1000)
    );
    int128 exponentModifier = ABDKMath64x64.div(ABDKMath64x64.fromInt(1), ABDKMath64x64.fromInt(25));
    int128 exponent = ABDKMath64x64.mul(exponentModifier, strengthDifferenceAtClientPrecision);
    int128 damageModifier = ABDKMath64x64.exp(exponent);
    int128 damage = ABDKMath64x64.mul(ABDKMath64x64.fromInt(30), damageModifier);

    return ABDKMath64x64.toInt(ABDKMath64x64.mul(damage, ABDKMath64x64.fromInt(1000)));
  }

  // -10 * (100 - HP) / 100
  // 30 HP => lose 7 Strength
  function calculateStrengthFromRemainingHealth(Combat memory combat) public pure returns (int32) {
    return combat.strength - (100000 - combat.health) / 10;
  }
}
