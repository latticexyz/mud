// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { World } from "../src/World.sol";
import { WorldProxy } from "../src/WorldProxy.sol";
import { IBaseWorld } from "../src/codegen/interfaces/IBaseWorld.sol";
import { createInitModule } from "./createInitModule.sol";

function createWorldProxy() returns (IBaseWorld world) {
  address worldImplementationAddress = address(new World());
  world = IBaseWorld(address(new WorldProxy(worldImplementationAddress)));

  world.initialize(createInitModule());
}
