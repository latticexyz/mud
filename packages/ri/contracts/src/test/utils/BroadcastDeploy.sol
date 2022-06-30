// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

// Foundry
import { DSTest } from "ds-test/test.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";
import { Utilities } from "./Utilities.sol";
import { Cheats } from "./Cheats.sol";
// ECS
import { World } from "solecs/World.sol";
// Diamonds
import { Diamantaire } from "../../diamond/Diamantaire.sol";
import { Diamond } from "../../diamond/Diamond.sol";
import { IDiamondCut } from "../../diamond/interfaces/IDiamondCut.sol";
import { AppStorage, Config } from "../../libraries/LibAppStorage.sol";
// Facets
import { EmberFacet } from "../../facets/EmberFacet.sol";
import { InitializeFacet } from "../../facets/InitializeFacet.sol";
import { DebugFacet } from "../../facets/DebugFacet.sol";
// Facets: Systems
import { CastSpellFacet } from "../../facets/systems/CastSpellFacet.sol";

// Libs
import { LibDeploy, DeployResult } from "../../libraries/LibDeploy.sol";

// Components
import { EmbodiedSystemArgumentComponent } from "../../components/EmbodiedSystemArgumentComponent.sol";
import { EntityTypeComponent } from "../../components/EntityTypeComponent.sol";
import { GameConfigComponent } from "../../components/GameConfigComponent.sol";
import { LastActionTurnComponent } from "../../components/LastActionTurnComponent.sol";
import { LearnedSpellsComponent } from "../../components/LearnedSpellsComponent.sol";
import { MaxDistanceComponent } from "../../components/MaxDistanceComponent.sol";
import { MineableComponent } from "../../components/MineableComponent.sol";
import { MovableComponent } from "../../components/MovableComponent.sol";
import { OwnedByComponent } from "../../components/OwnedByComponent.sol";
import { PersonaComponent } from "../../components/PersonaComponent.sol";
import { PositionComponent } from "../../components/PositionComponent.sol";
import { SpellComponent } from "../../components/SpellComponent.sol";
import { StaminaComponent } from "../../components/StaminaComponent.sol";
import { UntraversableComponent } from "../../components/UntraversableComponent.sol";

// Access Controllers
import { PersonaAccessController } from "../../access/PersonaAccessController.sol";

// Content Creators
import { SpellContentCreator } from "../../entities/SpellContentCreator.sol";

// Embodied Systems
import { CreateEntityFromPrototypeEmbodiedSystem } from "../../embodied/CreateEntityFromPrototypeEmbodiedSystem.sol";

// Outside World
import { MockL2Bridge } from "persona/test/mocks/MockL2Bridge.sol";
import { MockConsumer } from "persona/test/mocks/MockConsumer.sol";
import { Persona } from "persona/L1/Persona.sol";
import { EmptyPersonaTokenURIGenerator } from "persona/L1/EmptyPersonaTokenURIGenerator.sol";
import { PersonaMirror } from "persona/L2/PersonaMirror.sol";
import { PersonaAllMinter } from "persona/L1/PersonaAllMinter.sol";

// Fixtures
import { TestContentCreator } from "../fixtures/TestContentCreator.sol";
import { TestEmbodiedSystem } from "../fixtures/TestEmbodiedSystem.sol";
import { PersonaFixture } from "../fixtures/PersonaFixture.sol";

contract Deploy is DSTest {
  Cheats internal immutable vm = Cheats(HEVM_ADDRESS);

  function deployEmber(address _deployer) public returns (address) {
    vm.startBroadcast(_deployer);
    DeployResult memory result = LibDeploy.deploy(_deployer, address(0));
    vm.stopBroadcast();
    return address(result.diamond);
  }
}
