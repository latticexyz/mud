// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/System.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { GameConfigComponent, ID as GameConfigComponentID, GameConfig, GodID } from "../components/GameConfigComponent.sol";
import { CombatStrengthComponent, ID as CombatStrengthComponentID, CombatStrength } from "../components/CombatStrengthComponent.sol";

uint256 constant ID = uint256(keccak256("mudwar.system.GameConfig"));

import { CombatTypes, CombatTypesLength } from "../utils/Types.sol";

contract GameConfigSystem is System {
  constructor(IUint256Component _components, IWorld _world) System(_components, _world) {}

  function requirement(bytes memory) public view returns (bytes memory) {
    require(msg.sender == _owner, "only owner can set config");
  }

  function execute(bytes memory arguments) public returns (bytes memory) {
    requirement(arguments);
    GameConfigComponent(getAddressById(components, GameConfigComponentID)).set(
      GodID,
      GameConfig({ startTime: block.timestamp, turnLength: uint256(40) })
    );

    CombatStrengthComponent combatStrengthComponent = CombatStrengthComponent(
      getAddressById(components, CombatStrengthComponentID)
    );

    uint256 passiveId = uint256(keccak256(abi.encodePacked("mudwar.CombatStrength", uint32(CombatTypes.Passive))));
    int32[] memory combatTypeStrengthBonuses = new int32[](CombatTypesLength);
    combatTypeStrengthBonuses[uint32(CombatTypes.Passive)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Sword)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Spear)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Cavalry)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Ranged)] = 0;

    combatStrengthComponent.set(passiveId, CombatStrength(combatTypeStrengthBonuses));

    uint256 swordId = uint256(keccak256(abi.encodePacked("mudwar.CombatStrength", uint32(CombatTypes.Sword))));
    combatTypeStrengthBonuses[uint32(CombatTypes.Passive)] = 6_000;
    combatTypeStrengthBonuses[uint32(CombatTypes.Sword)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Spear)] = 6_000;
    combatTypeStrengthBonuses[uint32(CombatTypes.Cavalry)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Ranged)] = 0;

    combatStrengthComponent.set(swordId, CombatStrength(combatTypeStrengthBonuses));

    uint256 spearId = uint256(keccak256(abi.encodePacked("mudwar.CombatStrength", uint32(CombatTypes.Spear))));
    combatTypeStrengthBonuses[uint32(CombatTypes.Passive)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Sword)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Spear)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Cavalry)] = 12_000;
    combatTypeStrengthBonuses[uint32(CombatTypes.Ranged)] = 0;

    combatStrengthComponent.set(spearId, CombatStrength(combatTypeStrengthBonuses));

    uint256 cavalryId = uint256(keccak256(abi.encodePacked("mudwar.CombatStrength", uint32(CombatTypes.Cavalry))));
    combatTypeStrengthBonuses[uint32(CombatTypes.Passive)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Sword)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Spear)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Cavalry)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Ranged)] = 10_000;

    combatStrengthComponent.set(cavalryId, CombatStrength(combatTypeStrengthBonuses));

    uint256 rangedId = uint256(keccak256(abi.encodePacked("mudwar.CombatStrength", uint32(CombatTypes.Ranged))));
    combatTypeStrengthBonuses[uint32(CombatTypes.Passive)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Sword)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Spear)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Cavalry)] = 0;
    combatTypeStrengthBonuses[uint32(CombatTypes.Ranged)] = 0;

    combatStrengthComponent.set(rangedId, CombatStrength(combatTypeStrengthBonuses));
  }

  function requirementTyped() public view returns (bytes memory) {
    return requirement(new bytes(0));
  }

  function executeTyped() public returns (bytes memory) {
    return execute(new bytes(0));
  }
}
