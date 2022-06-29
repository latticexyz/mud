// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";
import { World } from "solecs/World.sol";
import { Utilities } from "./utils/Utilities.sol";
import { Deploy } from "./utils/Deploy.sol";
// Facets
import { EmberFacet } from "../facets/EmberFacet.sol";
import { DebugFacet } from "../facets/DebugFacet.sol";
import { InitializeFacet } from "../facets/InitializeFacet.sol";
import { CastSpellFacet } from "../facets/systems/CastSpellFacet.sol";
// Components
import { EmbodiedSystemArgumentComponent, ID as EmbodiedSystemArgumentComponentID } from "../components/EmbodiedSystemArgumentComponent.sol";
import { EntityTypeComponent, ID as EntityTypeComponentID } from "../components/EntityTypeComponent.sol";
import { LearnedSpellsComponent, ID as LearnedSpellsComponentID } from "../components/LearnedSpellsComponent.sol";
import { MaxDistanceComponent, ID as MaxDistanceComponentID } from "../components/MaxDistanceComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "../components/OwnedByComponent.sol";
import { PersonaComponent, ID as PersonaComponentID } from "../components/PersonaComponent.sol";
import { PositionComponent, ID as PositionComponentID } from "../components/PositionComponent.sol";
import { SpellComponent, ID as SpellComponentID } from "../components/SpellComponent.sol";

contract EmberTest is DSTest {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);
  Utilities internal immutable utils = new Utilities();

  address payable internal alice;
  address payable internal bob;
  address payable internal eve;
  address internal deployer;
  address internal diamondAddress;

  Deploy internal deploy = new Deploy();

  // Facets
  EmberFacet internal emberFacet;
  DebugFacet internal debugFacet;
  InitializeFacet internal initializeFacet;
  CastSpellFacet internal castSpellFacet;
  // Ecs
  World internal world;
  // Components
  EmbodiedSystemArgumentComponent internal embodiedSystemArgumentComponent;
  EntityTypeComponent internal entityTypeComponent;
  LearnedSpellsComponent internal learnedSpellsComponent;
  MaxDistanceComponent internal maxDistanceComponent;
  OwnedByComponent internal ownedByComponent;
  PersonaComponent internal personaComponent;
  PositionComponent internal positionComponent;
  SpellComponent internal spellComponent;

  function setUp() public {
    deployer = deploy.deployer();
    diamondAddress = deploy.deployEmber();
    deploy.deployTestFixtures();

    emberFacet = EmberFacet(diamondAddress);
    debugFacet = DebugFacet(diamondAddress);
    initializeFacet = InitializeFacet(diamondAddress);
    castSpellFacet = CastSpellFacet(diamondAddress);

    alice = utils.getNextUserAddress();
    bob = utils.getNextUserAddress();
    eve = utils.getNextUserAddress();
    world = deploy.world();

    embodiedSystemArgumentComponent = EmbodiedSystemArgumentComponent(
      world.getComponent(EmbodiedSystemArgumentComponentID)
    );
    entityTypeComponent = EntityTypeComponent(world.getComponent(EntityTypeComponentID));
    learnedSpellsComponent = LearnedSpellsComponent(world.getComponent(LearnedSpellsComponentID));
    maxDistanceComponent = MaxDistanceComponent(world.getComponent(MaxDistanceComponentID));
    ownedByComponent = OwnedByComponent(world.getComponent(OwnedByComponentID));
    personaComponent = PersonaComponent(world.getComponent(PersonaComponentID));
    positionComponent = PositionComponent(world.getComponent(PositionComponentID));
    spellComponent = SpellComponent(world.getComponent(SpellComponentID));
  }
}
