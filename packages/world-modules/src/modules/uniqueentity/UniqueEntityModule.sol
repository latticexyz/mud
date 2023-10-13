// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { InstalledModules } from "@latticexyz/world/src/codegen/index.sol";

import { Module } from "@latticexyz/world/src/Module.sol";
import { WorldContextConsumer } from "@latticexyz/world/src/WorldContext.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

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
    // Naive check to ensure this is only installed once
    // TODO: only revert if there's nothing to do
    if (InstalledModules.getModuleAddress(getName(), keccak256(args)) != address(0)) {
      revert Module_AlreadyInstalled();
    }

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

  function install(bytes memory args) public {
    // Naive check to ensure this is only installed once
    // TODO: only revert if there's nothing to do
    if (InstalledModules.getModuleAddress(getName(), keccak256(args)) != address(0)) {
      revert Module_AlreadyInstalled();
    }

    IBaseWorld world = IBaseWorld(_world());

    // Register table
    UniqueEntity.register(TABLE_ID);

    // Register system
    world.registerSystem(SYSTEM_ID, uniqueEntitySystem, true);

    // Register system's functions
    world.registerFunctionSelector(SYSTEM_ID, "getUniqueEntity()");
  }
}
