// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

// TODO: Refactor to use LibDeploy

// Foundry
import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";
import { Utilities } from "./Utilities.sol";
// ECS
import { World } from "solecs/World.sol";
// Diamonds
// import { Diamantaire } from "../../diamond/Diamantaire.sol";
// import { Diamond } from "../../diamond/Diamond.sol";
// import { IDiamondCut } from "../../diamond/interfaces/IDiamondCut.sol";
// import { AppStorage, Config } from "../../libraries/LibAppStorage.sol";
// // Facets
// import { EmberFacet } from "../../facets/EmberFacet.sol";
// import { InitializeFacet } from "../../facets/InitializeFacet.sol";
// import { DebugFacet } from "../../facets/DebugFacet.sol";
// // Facets: Systems
// import { CastSpellFacet } from "../../facets/CastSpellFacet.sol";

// // Components
// import { EmbodiedSystemArgumentComponent } from "../../components/EmbodiedSystemArgumentComponent.sol";
// import { EntityTypeComponent } from "../../components/EntityTypeComponent.sol";
// import { LearnedSpellsComponent } from "../../components/LearnedSpellsComponent.sol";
// import { MaxDistanceComponent } from "../../components/MaxDistanceComponent.sol";
// import { OwnedByComponent } from "../../components/OwnedByComponent.sol";
// import { PersonaComponent } from "../../components/PersonaComponent.sol";
// import { PositionComponent } from "../../components/PositionComponent.sol";
// import { SpellComponent } from "../../components/SpellComponent.sol";

// // Access Controllers
// import { PersonaAccessController } from "../../access/PersonaAccessController.sol";

// // Content Creators
// import { SpellContentCreator } from "../../entities/SpellContentCreator.sol";

// // Embodied Systems
// import { CreateEntityFromPrototypeEmbodiedSystem } from "../../embodied/CreateEntityFromPrototypeEmbodiedSystem.sol";
// TODO: refactor
// Outside World
import { MockL2Bridge } from "persona/test/mocks/MockL2Bridge.sol";
import { MockConsumer } from "persona/test/mocks/MockConsumer.sol";
import { Persona } from "persona/L1/Persona.sol";
import { EmptyPersonaTokenURIGenerator } from "persona/L1/EmptyPersonaTokenURIGenerator.sol";
import { PersonaMirror } from "persona/L2/PersonaMirror.sol";
import { PersonaAllMinter } from "persona/L1/PersonaAllMinter.sol";

// Fixtures
// import { TestContentCreator } from "../fixtures/TestContentCreator.sol";
// import { TestEmbodiedSystem } from "../fixtures/TestEmbodiedSystem.sol";
// import { PersonaFixture } from "../fixtures/PersonaFixture.sol";

contract Deploy is DSTest {
  // Vm internal immutable vm = Vm(HEVM_ADDRESS);
  // Utilities internal immutable utils = new Utilities();

  // Diamantaire internal diamantaire;
  // address public deployer;
  // Diamond public diamond;
  // World public world;
  // InitializeFacet public initializeFacetOnDiamond;
  // EmberFacet public emberFacetOnDiamond;
  // DebugFacet public debugFacetOnDiamond;

  // PersonaFixture public personaFixture;

  // MockL2Bridge public bridge;
  // Persona public persona;
  // PersonaAllMinter public personaAllMinter;
  // EmptyPersonaTokenURIGenerator public tokenURIGenerator;
  // PersonaMirror public personaMirror;
  // MockConsumer public consumer;

  function deployEmber() public returns (address) {
    // deployer = utils.getNextUserAddress();
    // vm.startPrank(deployer);

    // // deploy persona, persona mirror, and the bridge
    // bridge = new MockL2Bridge();
    // tokenURIGenerator = new EmptyPersonaTokenURIGenerator();
    // persona = new Persona("L", "L", address(bridge), address(0));
    // personaAllMinter = new PersonaAllMinter();
    // personaAllMinter.setPersona(address(persona));
    // persona.setMinter(address(personaAllMinter), true);
    // personaMirror = new PersonaMirror(address(persona), address(bridge));
    // persona.setPersonaMirrorL2(address(personaMirror));
    // consumer = new MockConsumer(address(personaMirror));

    // diamantaire = new Diamantaire();

    // bytes4[] memory functionSelectors;

    // IDiamondCut.FacetCut[] memory diamondCut = new IDiamondCut.FacetCut[](3);

    // // -------------------------------------------------------------------------
    // // adding initialize facet (add function selectors here)
    // // -------------------------------------------------------------------------
    // InitializeFacet initializeFacet = new InitializeFacet();

    // functionSelectors = new bytes4[](4);
    // functionSelectors[0] = InitializeFacet.initializeExternally.selector;
    // functionSelectors[1] = InitializeFacet.registerAccessControllerExternally.selector;
    // functionSelectors[2] = InitializeFacet.registerContentCreatorExternally.selector;
    // functionSelectors[3] = InitializeFacet.registerEmbodiedSystemExternally.selector;

    // diamondCut[0] = IDiamondCut.FacetCut({
    //   facetAddress: address(initializeFacet),
    //   action: IDiamondCut.FacetCutAction.Add,
    //   functionSelectors: functionSelectors
    // });

    // // -------------------------------------------------------------------------
    // // adding ember facet (add function selectors here)
    // // -------------------------------------------------------------------------
    // EmberFacet emberFacet = new EmberFacet();

    // functionSelectors = new bytes4[](1);
    // functionSelectors[0] = EmberFacet.world.selector;

    // diamondCut[1] = IDiamondCut.FacetCut({
    //   facetAddress: address(emberFacet),
    //   action: IDiamondCut.FacetCutAction.Add,
    //   functionSelectors: functionSelectors
    // });

    // // -------------------------------------------------------------------------
    // // adding debug facet (add function selectors here)
    // // -------------------------------------------------------------------------
    // DebugFacet debugFacet = new DebugFacet();

    // functionSelectors = new bytes4[](5);
    // functionSelectors[0] = DebugFacet.addComponentToEntityExternally.selector;
    // functionSelectors[1] = DebugFacet.removeComponentFromEntityExternally.selector;
    // functionSelectors[2] = DebugFacet.callerEntityID.selector;
    // functionSelectors[3] = DebugFacet.bulkSetState.selector;
    // functionSelectors[4] = DebugFacet.entryPoint.selector;

    // diamondCut[2] = IDiamondCut.FacetCut({
    //   facetAddress: address(debugFacet),
    //   action: IDiamondCut.FacetCutAction.Add,
    //   functionSelectors: functionSelectors
    // });

    // // -------------------------------------------------------------------------
    // // adding cast spell facet
    // // -------------------------------------------------------------------------
    // CastSpellFacet castSpellFacet = new CastSpellFacet();

    // functionSelectors = new bytes4[](1);
    // functionSelectors[0] = CastSpellFacet.castSpell.selector;

    // diamondCut[3] = IDiamondCut.FacetCut({
    //   facetAddress: address(castSpellFacet),
    //   action: IDiamondCut.FacetCutAction.Add,
    //   functionSelectors: functionSelectors
    // });

    // // Call initialize on the initialize facet
    // bytes memory data = abi.encodeWithSignature(
    //   "initializeExternally((bool,address))",
    //   Config({ resetCallerEntityID: false, personaMirror: address(personaMirror) })
    // );
    // // Create the diamond
    // diamond = diamantaire.createDiamond(deployer, diamondCut, data, 0);
    // address diamondAddress = address(diamond);
    // // Create reference to facets and the World
    // emberFacetOnDiamond = EmberFacet(diamondAddress);
    // initializeFacetOnDiamond = InitializeFacet(diamondAddress);
    // debugFacetOnDiamond = DebugFacet(diamondAddress);
    // address worldAddress = emberFacetOnDiamond.world();
    // world = World(worldAddress);
    // // Create each component and transfer ownership to the ember contract
    // (new EmbodiedSystemArgumentComponent(worldAddress)).transferOwnership(diamondAddress);
    // (new EntityTypeComponent(worldAddress)).transferOwnership(diamondAddress);
    // (new LearnedSpellsComponent(worldAddress)).transferOwnership(diamondAddress);
    // (new MaxDistanceComponent(worldAddress)).transferOwnership(diamondAddress);
    // (new OwnedByComponent(worldAddress)).transferOwnership(diamondAddress);
    // (new PersonaComponent(worldAddress)).transferOwnership(diamondAddress);
    // (new PositionComponent(worldAddress)).transferOwnership(diamondAddress);
    // (new SpellComponent(worldAddress)).transferOwnership(diamondAddress);
    // // Register access controllers
    // initializeFacetOnDiamond.registerAccessControllerExternally(address(new PersonaAccessController()));
    // // Register content creators
    // initializeFacetOnDiamond.registerContentCreatorExternally(address(new SpellContentCreator()));
    // // Register embodied systems
    // address createEntityFromPrototypeEmbodiedSystem = address(new CreateEntityFromPrototypeEmbodiedSystem());
    // initializeFacetOnDiamond.registerEmbodiedSystemExternally(
    //   createEntityFromPrototypeEmbodiedSystem,
    //   CreateEntityFromPrototypeEmbodiedSystem.createEntityFromPrototype.selector
    // );

    // vm.stopPrank();
    return address(0);
  }

  function deployTestFixtures() public {
    // vm.startPrank(deployer);
    // require(address(diamond) != address(0), "Diamond not deployed yet");
    // // Register content creators
    // initializeFacetOnDiamond.registerContentCreatorExternally(address(new TestContentCreator()));
    // // Register embodied systems
    // address testEmbodiedSystem = address(new TestEmbodiedSystem());
    // initializeFacetOnDiamond.registerEmbodiedSystemExternally(
    //   testEmbodiedSystem,
    //   TestEmbodiedSystem.dummyEmbodiedSystem.selector
    // );
    // personaFixture = new PersonaFixture(address(this));
    // vm.stopPrank();
  }
}
