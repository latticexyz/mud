// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { EmberTest } from "../EmberTest.sol";

// import { SpellComponent, Spell, ID as SpellComponentID } from "../../components/SpellComponent.sol";
// import { TEST_SPELL_ID, UNLEARNED_TEST_SPELL_ID, SPELL_CASTER_1, SPELL_CASTER_2, PLAYER_1 } from "../fixtures/TestContentCreator.sol";
// import { TestEmbodiedSystem } from "../fixtures/TestEmbodiedSystem.sol";
// import { PersonaFixture } from "../fixtures/PersonaFixture.sol";

contract SpellsTest is EmberTest {
  // function testSpellCreatedByContentCreator() public {
  //   Spell memory spell = spellComponent.getValue(TEST_SPELL_ID);
  //   assertEq(spell.embodiedSystemSelector, TestEmbodiedSystem.dummyEmbodiedSystem.selector);
  // }
  // function testCastTestSpell() public {
  //   deploy.personaFixture().mintPersonaToAddressAndSetupImpersonator(alice, bob, PLAYER_1);
  //   vm.startPrank(bob);
  //   castSpellFacet.castSpell(TEST_SPELL_ID, SPELL_CASTER_1, 0);
  //   vm.stopPrank();
  // }
  // function testFailCastTestSpellOnUnownedSpellCaster() public {
  //   deploy.personaFixture().mintPersonaToAddressAndSetupImpersonator(alice, bob, PLAYER_1);
  //   vm.startPrank(bob);
  //   castSpellFacet.castSpell(TEST_SPELL_ID, SPELL_CASTER_2, 0);
  //   vm.stopPrank();
  // }
  // function testFailCastNonSpell() public {
  //   deploy.personaFixture().mintPersonaToAddressAndSetupImpersonator(alice, bob, PLAYER_1);
  //   vm.startPrank(bob);
  //   castSpellFacet.castSpell(uint256(keccak256("ember.entities.fakeSpell")), SPELL_CASTER_1, 0);
  //   vm.stopPrank();
  // }
  // function testFailCastNonLearnedSpell() public {
  //   deploy.personaFixture().mintPersonaToAddressAndSetupImpersonator(alice, bob, PLAYER_1);
  //   vm.startPrank(bob);
  //   castSpellFacet.castSpell(UNLEARNED_TEST_SPELL_ID, SPELL_CASTER_1, 0);
  //   vm.stopPrank();
  // }
}
