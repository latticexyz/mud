// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { ROOT_NAMESPACE, CORE_MODULE_NAME } from "../../constants.sol";
import { WorldContext } from "../../WorldContext.sol";
import { IModule } from "../../interfaces/IModule.sol";
import { ReverseMappingHook } from "./ReverseMappingHook.sol";
import { ReverseMapping } from "./tables/ReverseMapping.sol";

/**
 * Args: table id to register a hook for.
 * The module registers another table that maps from hash of value to list of keys.
 * For now we just support single keys, no composite keys. (Those can be realized with parallel arrays.)
 * The module also deploys a hook that is called when a value is set and does the required computations to keep the index up to date.
 */
contract IndexModule is IModule, WorldContext {
  function getName() public pure returns (bytes16) {
    return bytes16("index");
  }

  function install(bytes memory args) public override {
    // Extract source and target table ids from args
    (uint256 sourceTableId, uint256 targetTableId) = abi.decode(args, (uint256, uint256));

    // Register the target table
    StoreSwitch.registerSchema(targetTableId, ReverseMapping.getSchema(), ReverseMapping.getKeySchema());

    // Deploy a new hook contract that is called when a value is set in the source table
    ReverseMappingHook hook = new ReverseMappingHook(targetTableId);

    // Register a hook that is called when a value is set in the source table
    StoreSwitch.registerStoreHook(sourceTableId, hook);
  }
}

/**
 * TODO:
 * - add proper support for modules to the CLI -> let users register modules in the config file, including the config that is passed to them.
 *   For this one specifically the config needs to include the table to track, and probably the tableId to store the result in?
 *
 * => there can be a single wrapper library to interact with the indexed tables, similar to `getEntitiesWithValue`
 */
