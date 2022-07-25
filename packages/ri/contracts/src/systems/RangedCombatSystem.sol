// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";
import "../libraries/ABDKMath64x64.sol";
import { QueryFragment, QueryType } from "solecs/interfaces/Query.sol";
import { getAddressById } from "solecs/utils.sol";

import { LibECS } from "../libraries/LibECS.sol";
import { LibQuery } from "solecs/LibQuery.sol";

import { LibUtils } from "../libraries/LibUtils.sol";
import { LibStamina } from "../libraries/LibStamina.sol";
import { LibInventory } from "../libraries/LibInventory.sol";
import { LibCombat } from "../libraries/LibCombat.sol";

import { PositionComponent, ID as PositionComponentID, Coord } from "../components/PositionComponent.sol";
import { RangedCombatComponent, ID as RangedCombatComponentID, RangedCombat } from "../components/RangedCombatComponent.sol";
import { CombatComponent, ID as CombatComponentID, Combat } from "../components/CombatComponent.sol";
import { CombatStrengthComponent, ID as CombatStrengthComponentID, CombatStrength } from "../components/CombatStrengthComponent.sol";
import { CapturableComponent, ID as CapturableComponentID } from "../components/CapturableComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { StaminaComponent, ID as StaminaComponentID } from "../components/StaminaComponent.sol";
import { InventoryComponent, ID as InventoryComponentID } from "../components/InventoryComponent.sol";
import { DeathComponent, ID as DeathComponentID } from "../components/DeathComponent.sol";
import { HeroComponent, ID as HeroComponentID } from "../components/HeroComponent.sol";

import { CombatTypes } from "../utils/Types.sol";

uint256 constant ID = uint256(keccak256("mudwar.system.RangedCombat"));

contract RangedCombatSystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function requirement(bytes memory arguments) public view returns (bytes memory) {
    (uint256 attacker, uint256 defender) = abi.decode(arguments, (uint256, uint256));

    require(attacker != defender, "no seppuku");

    require(LibECS.isOwnedByCaller(components, attacker), "attacker must be owned by caller");

    RangedCombatComponent rangedCombatComponent = RangedCombatComponent(
      getAddressById(components, RangedCombatComponentID)
    );
    require(rangedCombatComponent.has(attacker), "attacker has no ranged combat");
    RangedCombat memory rangedCombat = rangedCombatComponent.getValue(attacker);

    CombatComponent combatComponent = CombatComponent(getAddressById(components, CombatComponentID));
    require(combatComponent.has(defender), "defender has no combat");

    PositionComponent positionComponent = PositionComponent(getAddressById(components, PositionComponentID));
    Coord memory attackerPosition = positionComponent.getValue(attacker);
    Coord memory defenderPosition = positionComponent.getValue(defender);

    int32 distanceToTarget = LibUtils.manhattan(attackerPosition, defenderPosition);
    require(distanceToTarget <= rangedCombat.maxRange && distanceToTarget >= rangedCombat.minRange, "not in range");

    return abi.encode(attacker, defender);
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    (uint256 attacker, uint256 defender) = abi.decode(requirement(arguments), (uint256, uint256));

    LibStamina.modifyStamina(components, attacker, -1);
    shootTarget(attacker, defender);
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

  function shootTarget(uint256 attacker, uint256 defender) private {
    RangedCombatComponent rangedCombatComponent = RangedCombatComponent(
      getAddressById(components, RangedCombatComponentID)
    );
    CombatComponent combatComponent = CombatComponent(getAddressById(components, CombatComponentID));
    CapturableComponent capturableComponent = CapturableComponent(getAddressById(components, CapturableComponentID));

    RangedCombat memory attackerRangedCombat = rangedCombatComponent.getValue(attacker);
    Combat memory defenderCombat = combatComponent.getValue(defender);

    int32 strengthDifference = LibCombat.calculateStrengthDifference(
      components,
      uint32(CombatTypes.Ranged),
      attackerRangedCombat.strength,
      defenderCombat._type,
      defenderCombat.strength
    );
    int32 attackerDamage = int32(LibCombat.calculateDamage(strengthDifference));
    defenderCombat.health = defenderCombat.health - attackerDamage;
    combatComponent.set(defender, defenderCombat);

    if (defenderCombat.health <= 0) {
      // Ranged units cannot capture
      if (!capturableComponent.has(defender)) {
        LibCombat.kill(components, world, defender);
      }
    }
  }
}
