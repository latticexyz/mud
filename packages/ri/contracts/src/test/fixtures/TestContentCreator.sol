// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { World } from "solecs/World.sol";
import { console } from "forge-std/console.sol";

import { IContentCreator } from "../../entities/IContentCreator.sol";

import { UsingAppStorage } from "../../utils/UsingAppStorage.sol";
import { AppStorage } from "../../libraries/LibAppStorage.sol";
import { LibUtils } from "../../libraries/LibUtils.sol";

import { OwnedByComponent, ID as OwnedByComponentID } from "../../components/OwnedByComponent.sol";
import { LearnedSpellsComponent, ID as LearnedSpellsComponentID } from "../../components/LearnedSpellsComponent.sol";
import { SpellComponent, Spell, SpellTargetFilter, ID as SpellComponentID } from "../../components/SpellComponent.sol";
import { EmbodiedSystemArgumentComponent, ID as EmbodiedSystemArgumentComponentID } from "../../components/EmbodiedSystemArgumentComponent.sol";

import { TestEmbodiedSystem } from "./TestEmbodiedSystem.sol";

uint256 constant TEST_SPELL_ID = uint256(keccak256("ember.entities.testSpell"));
uint256 constant UNLEARNED_TEST_SPELL_ID = uint256(keccak256("ember.entities.unlearnedTestSpell"));
uint256 constant SPELL_CASTER_1 = uint256(keccak256("ember.entities.spellCaster1"));
uint256 constant SPELL_CASTER_2 = uint256(keccak256("ember.entities.spellCaster2"));
uint256 constant PLAYER_1 = uint256(keccak256("ember.entities.player1"));
uint256 constant PLAYER_2 = uint256(keccak256("ember.entities.player2"));

contract TestContentCreator is UsingAppStorage, IContentCreator {
  function createContent() external override {
    AppStorage storage s = getAppStorage();
    World world = s.world;
    // Reference to components
    OwnedByComponent ownedByComponent = OwnedByComponent(world.getComponent(OwnedByComponentID));
    SpellComponent spellComponent = SpellComponent(world.getComponent(SpellComponentID));
    LearnedSpellsComponent learnedSpellsComponent = LearnedSpellsComponent(
      world.getComponent(LearnedSpellsComponentID)
    );
    EmbodiedSystemArgumentComponent embodiedSystemArgument = EmbodiedSystemArgumentComponent(
      world.getComponent(EmbodiedSystemArgumentComponentID)
    );
    // Create test spells
    // TEST_SPELL_ID
    spellComponent.set(
      TEST_SPELL_ID,
      Spell({
        embodiedSystemSelector: TestEmbodiedSystem.dummyEmbodiedSystem.selector,
        spellTargetFilter: SpellTargetFilter.TILE
      })
    );
    bytes memory argument = abi.encode(uint256(42));
    embodiedSystemArgument.set(TEST_SPELL_ID, argument);
    // UNLEARNED_TEST_SPELL_ID
    spellComponent.set(
      UNLEARNED_TEST_SPELL_ID,
      Spell({
        embodiedSystemSelector: TestEmbodiedSystem.dummyEmbodiedSystem.selector,
        spellTargetFilter: SpellTargetFilter.TILE
      })
    );
    // Create spell casters
    // SPELL_CASTER_1
    uint256[] memory spellCasterLearnedSpells = new uint256[](1);
    spellCasterLearnedSpells[0] = TEST_SPELL_ID;
    learnedSpellsComponent.set(SPELL_CASTER_1, spellCasterLearnedSpells);
    ownedByComponent.set(SPELL_CASTER_1, PLAYER_1);
    // SPELL_CASTER_2
    spellCasterLearnedSpells = new uint256[](1);
    spellCasterLearnedSpells[0] = TEST_SPELL_ID;
    learnedSpellsComponent.set(SPELL_CASTER_2, spellCasterLearnedSpells);
    ownedByComponent.set(SPELL_CASTER_2, PLAYER_2);
  }
}
