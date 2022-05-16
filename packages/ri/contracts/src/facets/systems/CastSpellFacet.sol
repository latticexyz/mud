// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { World } from "solecs/World.sol";
import { Component } from "solecs/Component.sol";

import { LearnedSpellsComponent, ID as LearnedSpellsComponentID } from "../../components/LearnedSpellsComponent.sol";
import { SpellComponent, Spell, ID as SpellComponentID } from "../../components/SpellComponent.sol";
import { EmbodiedSystemArgumentComponent, ID as EmbodiedSystemArgumentComponentID } from "../../components/EmbodiedSystemArgumentComponent.sol";

import { UsingAccessControl } from "../../access/UsingAccessControl.sol";

import { AppStorage } from "../../libraries/LibAppStorage.sol";
import { LibECS } from "../../libraries/LibECS.sol";
import { LibEmbodiedSystem } from "../../libraries/LibEmbodiedSystem.sol";
import { LibUtils } from "../../libraries/LibUtils.sol";

contract CastSpellFacet is UsingAccessControl {
  AppStorage internal s;

  function castSpell(
    uint256 spellEntityID,
    uint256 sourceEntityID,
    uint256 targetEntityID
  ) public populateCallerEntityID {
    SpellComponent spellComponent = SpellComponent(s.world.getComponent(SpellComponentID));
    LearnedSpellsComponent learnedSpellsComponent = LearnedSpellsComponent(
      s.world.getComponent(LearnedSpellsComponentID)
    );
    EmbodiedSystemArgumentComponent embodiedSystemArgumentComponent = EmbodiedSystemArgumentComponent(
      s.world.getComponent(EmbodiedSystemArgumentComponentID)
    );
    // Fetch the spell
    require(spellComponent.has(spellEntityID), "Spell doesn't exist");
    Spell memory spell = spellComponent.getValue(spellEntityID);
    // Check if callerEntityID can control the source entity
    require(LibECS.doesCallerEntityIDOwnEntity(sourceEntityID), "You don't own the source entity");
    // Check if the source entity id has learned the spell
    require(learnedSpellsComponent.has(sourceEntityID), "Source has no learned spells");
    uint256[] memory learnedSpells = learnedSpellsComponent.getValue(sourceEntityID);
    require(LibUtils.arrayContains(learnedSpells, spellEntityID), "Source hasn't learned this spell");
    // Get argument if it exists on the spell
    bytes memory argument = new bytes(0);
    if (embodiedSystemArgumentComponent.has(spellEntityID)) {
      argument = embodiedSystemArgumentComponent.getValue(spellEntityID);
    }
    // Call the embodied system
    LibEmbodiedSystem.callEmbodiedSystem(spell.embodiedSystemSelector, argument);
  }
}
