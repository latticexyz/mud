// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IModule } from "../../interfaces/IModule.sol";

import { WorldContext } from "../../WorldContext.sol";
import { ResourceSelector } from "../../ResourceSelector.sol";

import { MODULE_NAMESPACE, USED_KEYS_NAMESPACE } from "./constants.sol";
import { KeysInTableHook } from "./KeysInTableHook.sol";
import { KeysInTable } from "./tables/KeysInTable.sol";
import { UsedKeysIndex } from "./tables/UsedKeysIndex.sol";
import { getTargetTableSelector } from "../utils/getTargetTableSelector.sol";

/**
 * This module deploys a hook that is called when a value is set in the `sourceTableId`
 * provided in the install methods arguments. The hook keeps track of the keys that are in a given table.
 * This mapping is stored in a table registered by the module at the `targetTableId` provided in the
 * install methods arguments.
 *
 * Note: if a table with composite keys is used, only the first key is indexed
 *
 * Note: this module currently expects to be `delegatecalled` via World.installRootModule.
 * Support for installing it via `World.installModule` depends on `World.callFrom` being implemented.
 */
contract KeysInTableModule is IModule, WorldContext {
  using ResourceSelector for bytes32;

  // The KeysInTableHook is deployed once and infers the target table id
  // from the source table id (passed as argument to the hook methods)
  KeysInTableHook immutable hook = new KeysInTableHook();

  function getName() public pure returns (bytes16) {
    return bytes16("index");
  }

  function setupNamespace(bytes8 moduleNamespace, bytes32 sourceTableId) internal {
    bytes32 targetTableSelector = getTargetTableSelector(moduleNamespace, sourceTableId);

    IBaseWorld world = IBaseWorld(_world());

    // Register the target table
    world.registerTable(
      targetTableSelector.getNamespace(),
      targetTableSelector.getName(),
      KeysInTable.getSchema(),
      KeysInTable.getKeySchema()
    );

    // Register metadata for the target table
    (string memory tableName, string[] memory fieldNames) = KeysInTable.getMetadata();
    world.setMetadata(targetTableSelector.getNamespace(), targetTableSelector.getName(), tableName, fieldNames);

    // Grant the hook access to the target table
    world.grantAccess(targetTableSelector.getNamespace(), targetTableSelector.getName(), address(hook));
  }

  function install(bytes memory args) public override {
    // Extract source table id from args
    bytes32 sourceTableId = abi.decode(args, (bytes32));

    setupNamespace(MODULE_NAMESPACE, sourceTableId);
    setupNamespace(USED_KEYS_NAMESPACE, sourceTableId);

    // Register a hook that is called when a value is set in the source table
    StoreSwitch.registerStoreHook(sourceTableId, hook);
  }
}
