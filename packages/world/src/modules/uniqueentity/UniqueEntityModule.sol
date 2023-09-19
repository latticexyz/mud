// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";

import { Module } from "../../Module.sol";
import { WorldContextConsumer } from "../../WorldContext.sol";
import { ResourceId } from "../../ResourceId.sol";
import { RESOURCE_TABLE, RESOURCE_SYSTEM } from "../../worldResourceTypes.sol";

import { UniqueEntity } from "./tables/UniqueEntity.sol";
import { UniqueEntitySystem } from "./UniqueEntitySystem.sol";

import { MODULE_NAME, TABLE_ID, SYSTEM_ID } from "./constants.sol";

/**
 * This module creates a table that stores a nonce, and
 * a public system that returns an incremented nonce each time.
 */
contract UniqueEntityModule is Module {
  // Since the UniqueEntitySystem only exists once per World and writes to
  // known tables, we can deploy it once and register it in multiple Worlds.
  UniqueEntitySystem private immutable uniqueEntitySystem = new UniqueEntitySystem();

  function getName() public pure returns (bytes16) {
    return MODULE_NAME;
  }

  function installRoot(bytes memory args) public {
    install(args);
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // Register table
    UniqueEntity.register(world, TABLE_ID);

    // Register system
    world.registerSystem(SYSTEM_ID, uniqueEntitySystem, true);

    // Register system's functions
    world.registerFunctionSelector(SYSTEM_ID, "getUniqueEntity", "()");
  }
}
