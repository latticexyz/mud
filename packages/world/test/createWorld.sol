// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { World } from "../src/World.sol";
import { IBaseWorld } from "../src/codegen/interfaces/IBaseWorld.sol";
import { createInitModule } from "./createInitModule.sol";

function createWorld() returns (IBaseWorld world) {
  world = IBaseWorld(address(new World()));
  world.initializeWorld();
  world.initialize(createInitModule());
}
