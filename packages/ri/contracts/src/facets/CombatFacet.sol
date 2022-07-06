// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { LibECS } from "../libraries/LibECS.sol";
import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";

import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";
import { UsingDiamondOwner } from "../diamond/utils/UsingDiamondOwner.sol";
import { UsingAccessControl } from "../access/UsingAccessControl.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { AttackComponent, ID as AttackComponentID, Attack } from "../components/AttackComponent.sol";
import { HealthComponent, ID as HealthComponentID, Health } from "../components/HealthComponent.sol";

contract CombatFacet is UsingDiamondOwner, UsingAccessControl {
  AppStorage internal s;

  function attackEntity(uint256 attacker, uint256 defender) external populateCallerEntityID {
    require(LibECS.doesCallerEntityIDOwnEntity(attacker), "You don't own this entity");

    HealthComponent healthComponent = HealthComponent(s.world.getComponent(HealthComponentID));
    require(healthComponent.has(defender), "defender has no health");

    AttackComponent attackComponent = AttackComponent(s.world.getComponent(AttackComponentID));
    require(attackComponent.has(attacker), "attacker has no attack");

    Attack memory attack = attackComponent.getValue(attacker);

    PositionComponent positionComponent = PositionComponent(s.world.getComponent(PositionComponentID));
    Coord memory attackerPosition = positionComponent.getValue(attacker);
    Coord memory defenderPosition = positionComponent.getValue(defender);

    int32 distanceToTarget = LibUtils.manhattan(attackerPosition, defenderPosition);
    require(distanceToTarget <= attack.range, "not in range");

    LibStamina.reduceStamina(attacker, 1);
    Health memory newDefenderHealth = dealDamage(attacker, defender);

    // Target tries to defend themselves
    // TODO check if defender is in range before retaliation
    (int32 defenderStamina, int32 _atTurn) = LibStamina.getUpdatedStamina(defender);
    if (
      defenderStamina >= 1 &&
      newDefenderHealth.current > 0 &&
      healthComponent.has(attacker) &&
      attackComponent.has(defender)
    ) {
      LibStamina.reduceStamina(defender, 1);
      dealDamage(defender, attacker);
    }
  }

  function dealDamage(uint256 attacker, uint256 defender) private returns (Health memory newDefenderHealth) {
    AttackComponent attackComponent = AttackComponent(s.world.getComponent(AttackComponentID));
    require(attackComponent.has(attacker), "attacker has no attack");

    HealthComponent healthComponent = HealthComponent(s.world.getComponent(HealthComponentID));
    require(healthComponent.has(defender), "defender has no health");

    Attack memory attackerAttack = attackComponent.getValue(attacker);
    Health memory defenderHealth = healthComponent.getValue(defender);

    int32 attackStrength = attackerAttack.strength;
    if (healthComponent.has(attacker)) {
      Health memory attackerHealth = healthComponent.getValue(attacker);
      if (attackerHealth.current < attackerHealth.max) {
        attackStrength = (((attackerHealth.current * 100) / attackerHealth.max) * attackStrength) / 100;
      }
    }

    newDefenderHealth = calculateNewHealth(defenderHealth, attackStrength);
    healthComponent.set(defender, newDefenderHealth);
  }

  function calculateNewHealth(Health memory health, int32 attackStrength)
    private
    pure
    returns (Health memory newHealth)
  {
    int32 remainingHealth = health.current - attackStrength;
    newHealth = Health({ current: remainingHealth, max: health.max });
  }
}
