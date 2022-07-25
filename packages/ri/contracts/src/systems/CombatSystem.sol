// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";
import "../libraries/ABDKMath64x64.sol";
import { QueryFragment, QueryType } from "solecs/interfaces/Query.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibECS } from "../libraries/LibECS.sol";
import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";
import { LibCombat } from "../libraries/LibCombat.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { CombatComponent, ID as CombatComponentID, Combat } from "../components/CombatComponent.sol";
import { CombatStrengthComponent, ID as CombatStrengthComponentID, CombatStrength } from "../components/CombatStrengthComponent.sol";
import { CapturableComponent, ID as CapturableComponentID } from "../components/CapturableComponent.sol";

import { CombatTypes } from "../utils/Types.sol";

uint256 constant ID = uint256(keccak256("mudwar.system.Combat"));

contract CombatSystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    (uint256 attacker, uint256 defender) = abi.decode(arguments, (uint256, uint256));

    require(attacker != defender, "no seppuku");

    require(LibECS.isOwnedByCaller(components, attacker), "attacker must be owned by caller");

    CombatComponent combatComponent = CombatComponent(getAddressById(components, CombatComponentID));
    require(combatComponent.has(attacker), "attacker has no combat");
    require(combatComponent.has(defender), "defender has no combat");

    Combat memory combat = combatComponent.getValue(attacker);
    require(!combat.passive, "passive units cannot attack");

    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    Coord memory attackerPosition = positionComponent.getValue(attacker);
    Coord memory defenderPosition = positionComponent.getValue(defender);

    int32 distanceToTarget = LibUtils.manhattan(attackerPosition, defenderPosition);
    require(distanceToTarget <= 1, "not in range");

    return abi.encode(attacker, defender);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 attacker, uint256 defender) = abi.decode(requirement(arguments), (uint256, uint256));

    LibStamina.modifyStamina(components, attacker, -1);
    engageInCombat(attacker, defender);
  }

  function requirementTyped(uint256 attacker, uint256 defender) public view returns (bytes memory) {
    return requirement(abi.encode(attacker, defender));
  }

  function executeTyped(uint256 attacker, uint256 defender) public returns (bytes memory) {
    return execute(abi.encode(attacker, defender));
  }

  // ------------------------
  // Internals
  // ------------------------

  function engageInCombat(uint256 attacker, uint256 defender) private {
    CombatComponent combatComponent = CombatComponent(getAddressById(components, CombatComponentID));
    CapturableComponent capturableComponent = CapturableComponent(getAddressById(components, CapturableComponentID));

    Combat memory attackerCombat = combatComponent.getValue(attacker);
    Combat memory defenderCombat = combatComponent.getValue(defender);

    int32 strengthDifference = LibCombat.calculateStrengthDifference(
      components,
      attackerCombat._type,
      attackerCombat.strength,
      defenderCombat._type,
      defenderCombat.strength
    );

    if (!defenderCombat.passive) {
      int32 defenderDamage = int32(LibCombat.calculateDamage(-strengthDifference));
      attackerCombat.health = attackerCombat.health - defenderDamage;
      combatComponent.set(attacker, attackerCombat);

      if (attackerCombat.health <= 0) {
        if (capturableComponent.has(attacker)) {
          LibCombat.capture(components, defender, attacker);
        } else {
          LibCombat.kill(components, world, attacker);
        }
      }
    }

    int32 attackerDamage = int32(LibCombat.calculateDamage(strengthDifference));
    defenderCombat.health = defenderCombat.health - attackerDamage;
    combatComponent.set(defender, defenderCombat);

    if (defenderCombat.health <= 0) {
      if (capturableComponent.has(defender)) {
        LibCombat.capture(components, attacker, defender);
      } else {
        LibCombat.kill(components, world, defender);
      }
    }
  }
}
