// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";

import { Module } from "../../Module.sol";
import { WorldContextConsumer } from "../../WorldContext.sol";
import { revertWithBytes } from "../../revertWithBytes.sol";

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

  function installRoot(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // Register table
    UniqueEntity._register(TABLE_ID);

    // Register system
    (bool success, bytes memory data) = address(world).delegatecall(
      abi.encodeCall(world.registerSystem, (SYSTEM_ID, uniqueEntitySystem, true))
    );
    if (!success) revertWithBytes(data);

    // Register system's functions
    (success, data) = address(world).delegatecall(
      abi.encodeCall(world.registerFunctionSelector, (SYSTEM_ID, "getUniqueEntity()"))
    );
    if (!success) revertWithBytes(data);
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // Register table
    UniqueEntity.register(world, TABLE_ID);

    // Register system
    world.registerSystem(SYSTEM_ID, uniqueEntitySystem, true);

    // Register system's functions
    world.registerFunctionSelector(SYSTEM_ID, "getUniqueEntity()");
  }
}
