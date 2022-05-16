// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { World } from "solecs/World.sol";
import { console } from "forge-std/console.sol";

import { IContentCreator } from "./IContentCreator.sol";

import { UsingAppStorage } from "../utils/UsingAppStorage.sol";
import { AppStorage } from "../libraries/LibAppStorage.sol";
import { LibUtils } from "../libraries/LibUtils.sol";

import { SpellComponent, Spell, SpellTargetFilter, ID as SpellComponentID } from "../components/SpellComponent.sol";
import { EmbodiedSystemArgumentComponent, ID as EmbodiedSystemArgumentComponentID } from "../components/EmbodiedSystemArgumentComponent.sol";

import { CreateEntityFromPrototypeEmbodiedSystem } from "../embodied/CreateEntityFromPrototypeEmbodiedSystem.sol";

uint256 constant SPELL_ONE = uint256(keccak256("ember.entities.spellOne"));

contract SpellContentCreator is UsingAppStorage, IContentCreator {
  function createContent() external override {
    AppStorage storage s = getAppStorage();
    World world = s.world;
    SpellComponent spellComponent = SpellComponent(world.getComponent(SpellComponentID));
    EmbodiedSystemArgumentComponent embodiedSystemArgument = EmbodiedSystemArgumentComponent(
      world.getComponent(EmbodiedSystemArgumentComponentID)
    );
    // Create spells
    spellComponent.set(
      SPELL_ONE,
      Spell({
        embodiedSystemSelector: CreateEntityFromPrototypeEmbodiedSystem.createEntityFromPrototype.selector,
        spellTargetFilter: SpellTargetFilter.TILE
      })
    );
    bytes memory argument = abi.encode(uint256(42));
    embodiedSystemArgument.set(SPELL_ONE, argument);
  }
}
