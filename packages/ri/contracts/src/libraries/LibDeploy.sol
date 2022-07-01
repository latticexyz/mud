// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

// Foundry
import { DSTest } from "ds-test/test.sol";
import { console } from "forge-std/console.sol";
import { Cheats } from "../test/utils/Cheats.sol";

// ECS
import { World } from "solecs/World.sol";

// Diamonds
import { Diamantaire } from "../diamond/Diamantaire.sol";
import { Diamond } from "../diamond/Diamond.sol";
import { IDiamondCut } from "../diamond/interfaces/IDiamondCut.sol";
import { AppStorage, Config } from "../libraries/LibAppStorage.sol";

// Facets
import { InitializeFacet } from "../facets/InitializeFacet.sol";
import { EmberFacet } from "../facets/EmberFacet.sol";
import { DebugFacet } from "../facets/DebugFacet.sol";
import { CastSpellFacet } from "../facets/CastSpellFacet.sol";

// Components
import { EmbodiedSystemArgumentComponent } from "../components/EmbodiedSystemArgumentComponent.sol";
import { EntityTypeComponent } from "../components/EntityTypeComponent.sol";
import { GameConfigComponent } from "../components/GameConfigComponent.sol";
import { LastActionTurnComponent } from "../components/LastActionTurnComponent.sol";
import { LearnedSpellsComponent } from "../components/LearnedSpellsComponent.sol";
import { MaxDistanceComponent } from "../components/MaxDistanceComponent.sol";
import { MineableComponent } from "../components/MineableComponent.sol";
import { MovableComponent } from "../components/MovableComponent.sol";
import { OwnedByComponent } from "../components/OwnedByComponent.sol";
import { PersonaComponent } from "../components/PersonaComponent.sol";
import { PositionComponent } from "../components/PositionComponent.sol";
import { SpellComponent } from "../components/SpellComponent.sol";
import { StaminaComponent } from "../components/StaminaComponent.sol";
import { UntraversableComponent } from "../components/UntraversableComponent.sol";

// Access Controllers
import { PersonaAccessController } from "../access/PersonaAccessController.sol";

// Content Creators
import { SpellContentCreator } from "../entities/SpellContentCreator.sol";

// Embodied Systems
import { CreateEntityFromPrototypeEmbodiedSystem } from "../embodied/CreateEntityFromPrototypeEmbodiedSystem.sol";

// Outside World
import { MockL2Bridge } from "persona/test/mocks/MockL2Bridge.sol";
import { MockConsumer } from "persona/test/mocks/MockConsumer.sol";
import { Persona } from "persona/L1/Persona.sol";
import { EmptyPersonaTokenURIGenerator } from "persona/L1/EmptyPersonaTokenURIGenerator.sol";
import { PersonaMirror } from "persona/L2/PersonaMirror.sol";
import { PersonaAllMinter } from "persona/L1/PersonaAllMinter.sol";

struct DeployResult {
  Diamond diamond;
  World world;
  address deployer;
  MockL2Bridge bridge;
  Persona persona;
  PersonaAllMinter personaAllMinter;
  PersonaMirror personaMirror;
  EmptyPersonaTokenURIGenerator tokenURIGenerator;
}

library LibDeploy {
  function deploy(address _deployer, address _personaMirror) internal returns (DeployResult memory result) {
    result.deployer = _deployer;

    Diamantaire diamantaire = new Diamantaire();

    bytes4[] memory functionSelectors;

    IDiamondCut.FacetCut[] memory diamondCut = new IDiamondCut.FacetCut[](4);

    // ------------------------
    // Add facets
    // ------------------------

    // Add InitializeFacet
    InitializeFacet _InitializeFacet = new InitializeFacet();

    functionSelectors = new bytes4[](4);
    functionSelectors[0] = InitializeFacet.initializeExternally.selector;
    functionSelectors[1] = InitializeFacet.registerAccessControllerExternally.selector;
    functionSelectors[2] = InitializeFacet.registerContentCreatorExternally.selector;
    functionSelectors[3] = InitializeFacet.registerEmbodiedSystemExternally.selector;

    diamondCut[0] = IDiamondCut.FacetCut({
      facetAddress: address(_InitializeFacet),
      action: IDiamondCut.FacetCutAction.Add,
      functionSelectors: functionSelectors
    });

    // Add EmberFacet
    EmberFacet _EmberFacet = new EmberFacet();

    functionSelectors = new bytes4[](2);
    functionSelectors[0] = EmberFacet.world.selector;
    functionSelectors[1] = EmberFacet.configureWorld.selector;

    diamondCut[1] = IDiamondCut.FacetCut({
      facetAddress: address(_EmberFacet),
      action: IDiamondCut.FacetCutAction.Add,
      functionSelectors: functionSelectors
    });

    // Add DebugFacet
    DebugFacet _DebugFacet = new DebugFacet();

    functionSelectors = new bytes4[](5);
    functionSelectors[0] = DebugFacet.addComponentToEntityExternally.selector;
    functionSelectors[1] = DebugFacet.removeComponentFromEntityExternally.selector;
    functionSelectors[2] = DebugFacet.callerEntityID.selector;
    functionSelectors[3] = DebugFacet.bulkSetState.selector;
    functionSelectors[4] = DebugFacet.entryPoint.selector;

    diamondCut[2] = IDiamondCut.FacetCut({
      facetAddress: address(_DebugFacet),
      action: IDiamondCut.FacetCutAction.Add,
      functionSelectors: functionSelectors
    });

    // Add CastSpellFacet
    CastSpellFacet _CastSpellFacet = new CastSpellFacet();

    functionSelectors = new bytes4[](1);
    functionSelectors[0] = CastSpellFacet.castSpell.selector;

    diamondCut[3] = IDiamondCut.FacetCut({
      facetAddress: address(_CastSpellFacet),
      action: IDiamondCut.FacetCutAction.Add,
      functionSelectors: functionSelectors
    });

    // ------------------------
    // Deploy
    // ------------------------

    if (_personaMirror == address(0)) {
      // deploy persona, persona mirror, and the bridge
      result.bridge = new MockL2Bridge();
      result.tokenURIGenerator = new EmptyPersonaTokenURIGenerator();
      result.persona = new Persona("L", "L", address(result.bridge), address(0));
      result.personaAllMinter = new PersonaAllMinter();
      result.personaAllMinter.setPersona(address(result.persona));
      result.persona.setMinter(address(result.personaAllMinter), true);
      result.personaMirror = new PersonaMirror(address(result.persona), address(result.bridge));
      result.persona.setPersonaMirrorL2(address(result.personaMirror));
    } else {
      result.personaMirror = PersonaMirror(_personaMirror);
    }

    // Deploy the diamond
    result.diamond = diamantaire.createDiamond(result.deployer, diamondCut, new bytes(0), 0);
    address diamondAddress = address(result.diamond);

    // Call initialize on the initialize facet
    InitializeFacet(diamondAddress).initializeExternally(Config(false, address(result.personaMirror)));

    address worldAddress = EmberFacet(diamondAddress).world();
    result.world = World(worldAddress);

    // Deploy each component and transfer ownership to the diamond contract
    (new EmbodiedSystemArgumentComponent(worldAddress)).transferOwnership(diamondAddress);
    (new EntityTypeComponent(worldAddress)).transferOwnership(diamondAddress);
    (new GameConfigComponent(worldAddress)).transferOwnership(diamondAddress);
    (new LastActionTurnComponent(worldAddress)).transferOwnership(diamondAddress);
    (new LearnedSpellsComponent(worldAddress)).transferOwnership(diamondAddress);
    (new MaxDistanceComponent(worldAddress)).transferOwnership(diamondAddress);
    (new MineableComponent(worldAddress)).transferOwnership(diamondAddress);
    (new MovableComponent(worldAddress)).transferOwnership(diamondAddress);
    (new OwnedByComponent(worldAddress)).transferOwnership(diamondAddress);
    (new PersonaComponent(worldAddress)).transferOwnership(diamondAddress);
    (new PositionComponent(worldAddress)).transferOwnership(diamondAddress);
    (new SpellComponent(worldAddress)).transferOwnership(diamondAddress);
    (new StaminaComponent(worldAddress)).transferOwnership(diamondAddress);
    (new UntraversableComponent(worldAddress)).transferOwnership(diamondAddress);

    // ------------------------
    // Initialize
    // ------------------------

    // Register access controllers
    InitializeFacet(diamondAddress).registerAccessControllerExternally(address(new PersonaAccessController()));

    // Register content creators
    InitializeFacet(diamondAddress).registerContentCreatorExternally(address(new SpellContentCreator()));

    // Register embodied systems
    address createEntityFromPrototypeEmbodiedSystem = address(new CreateEntityFromPrototypeEmbodiedSystem());
    InitializeFacet(diamondAddress).registerEmbodiedSystemExternally(
      createEntityFromPrototypeEmbodiedSystem,
      CreateEntityFromPrototypeEmbodiedSystem.createEntityFromPrototype.selector
    );

    // Configure world
    EmberFacet(diamondAddress).configureWorld();
  }
}
