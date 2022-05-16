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

contract InitializeFacet is UsingDiamondOwner, UsingAccessControl {
  AppStorage internal s;

  function initializeExternally(Config calldata config) external {
    s.config = config;
    s.world = new World();
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
