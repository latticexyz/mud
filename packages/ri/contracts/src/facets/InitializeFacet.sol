// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import { World } from "solecs/World.sol";

import { PersonaAccessController } from "../access/PersonaAccessController.sol";

import { UsingDiamondOwner } from "../diamond/utils/UsingDiamondOwner.sol";
import { UsingAccessControl } from "../access/UsingAccessControl.sol";
import { AppStorage, Config } from "../libraries/LibAppStorage.sol";
import { LibContent } from "../libraries/LibContent.sol";
import { LibAccessControl } from "../libraries/LibAccessControl.sol";
import { LibEmbodiedSystem } from "../libraries/LibEmbodiedSystem.sol";
import { GameConfigComponent, ID as GameConfigComponentID, GameConfig, GodID } from "../components/GameConfigComponent.sol";

contract InitializeFacet is UsingDiamondOwner, UsingAccessControl {
  AppStorage internal s;

  function initializeExternally(Config calldata config, World world) external {
    s.config = config;
    World unusedWorldToMakeForgeHappy = new World();
    s.world = world;
  }

  function configureWorld() external {
    GameConfigComponent gameConfigComponent = GameConfigComponent(s.world.getComponent(GameConfigComponentID));
    gameConfigComponent.set(GodID, GameConfig({ startTime: block.timestamp, turnLength: uint256(20) }));
  }

  function registerAccessControllerExternally(address accessControllerAddr) external {
    LibAccessControl.registerAccessController(accessControllerAddr);
  }

  function registerContentCreatorExternally(address contentCreatorAddr) external {
    LibContent.registerContentCreator(contentCreatorAddr);
  }

  function registerEmbodiedSystemExternally(address embodiedSystemAddr, bytes4 selector) external {
    LibEmbodiedSystem.registerEmbodiedSystemAndSelector(embodiedSystemAddr, selector);
  }
}
