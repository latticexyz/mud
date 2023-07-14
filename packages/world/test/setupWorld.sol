// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/interfaces/IBaseWorld.sol";
import { CoreModule } from "../src/modules/core/CoreModule.sol";

function setupWorld() returns (IBaseWorld world) {
  world = IBaseWorld(address(new World()));
  CoreModule core = new CoreModule();
  world.installRootModule(core, "");
}
