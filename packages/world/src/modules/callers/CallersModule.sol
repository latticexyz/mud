// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContext } from "../../WorldContext.sol";

import { Callers } from "./tables/Callers.sol";
import { CallersSystem } from "./CallersSystem.sol";

import { NAMESPACE, MODULE_NAME, SYSTEM_NAME, TABLE_NAME } from "./constants.sol";

/**
 * This module creates a table that stores a nonce, and
 * a public system that returns an incremented nonce each time.
 */
contract CallersModule is IModule, WorldContext {
  // Since the CallersSystem only exists once per World and writes to
  // known tables, we can deploy it once and register it in multiple Worlds.
  CallersSystem immutable callersSystem = new CallersSystem();

  function getName() public pure returns (bytes16) {
    return MODULE_NAME;
  }

  function install(bytes memory) public {
    IBaseWorld world = IBaseWorld(_world());

    // Register table
    world.registerTable(NAMESPACE, TABLE_NAME, Callers.getSchema(), Callers.getKeySchema());
    // Set table's metadata
    (string memory tableName, string[] memory fieldNames) = Callers.getMetadata();
    world.setMetadata(NAMESPACE, TABLE_NAME, tableName, fieldNames);

    // Register system
    world.registerSystem(NAMESPACE, SYSTEM_NAME, callersSystem, true);
    // Register system's functions
    world.registerFunctionSelector(NAMESPACE, SYSTEM_NAME, "pushCaller", "(address)");
    world.registerFunctionSelector(NAMESPACE, SYSTEM_NAME, "popCaller", "()");
    world.registerFunctionSelector(NAMESPACE, SYSTEM_NAME, "getLatestCaller", "()");
  }
}
