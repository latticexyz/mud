// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContext } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { UniqueEntity } from "./tables/UniqueEntity.sol";
import { UniqueEntitySystem } from "./UniqueEntitySystem.sol";

import { NAMESPACE, MODULE_NAME, SYSTEM_NAME, TABLE_NAME } from "./constants.sol";

/**
 * This module creates a table that stores a nonce, and
 * a public system that returns an incremented nonce each time.
 */
contract UniqueEntityModule is IModule, WorldContext {
  // Since the UniqueEntitySystem only exists once per World and writes to
  // known tables, we can deploy it once and register it in multiple Worlds.
  UniqueEntitySystem immutable uniqueEntitySystem = new UniqueEntitySystem();

  function getName() public pure returns (bytes16) {
    return MODULE_NAME;
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // Register table
    UniqueEntity.register(world, ResourceSelector.from(NAMESPACE, TABLE_NAME));

    // Register system
    world.registerSystem(NAMESPACE, SYSTEM_NAME, uniqueEntitySystem, true);

    // Register system's functions
    world.registerFunctionSelector(NAMESPACE, SYSTEM_NAME, "getUniqueEntity", "()");
  }
}
