// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContext } from "../../WorldContext.sol";

import { SnapSyncSystem } from "./SnapSyncSystem.sol";

import { NAMESPACE, MODULE_NAME, SYSTEM_NAME, TABLE_NAME } from "./constants.sol";

/**
 * NOTICE: Requires all tables in the world to use the KeysInTable module.
 * This module registers a system that allows clients to load a snapshot of the World state
 * by using view functions.
 */
contract SnapSyncModule is IModule, WorldContext {
  // Since the SnapSyncSystem only exists once per World and writes to
  // known tables, we can deploy it once and register it in multiple Worlds.
  SnapSyncSystem private immutable snapSyncSystem = new SnapSyncSystem();

  function getName() public pure returns (bytes16) {
    return MODULE_NAME;
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // Register system
    world.registerSystem(NAMESPACE, SYSTEM_NAME, snapSyncSystem, true);
    // Register system's functions
    world.registerFunctionSelector(NAMESPACE, SYSTEM_NAME, "getRecords", "(bytes32,uint256,uint256)");
    world.registerFunctionSelector(NAMESPACE, SYSTEM_NAME, "getNumKeysInTable", "(bytes32)");
  }
}
