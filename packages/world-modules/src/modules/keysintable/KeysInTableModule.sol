// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { BEFORE_SET_RECORD, AFTER_SPLICE_STATIC_DATA, AFTER_SPLICE_DYNAMIC_DATA, BEFORE_DELETE_RECORD } from "@latticexyz/store/src/storeHookTypes.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

import { Module } from "@latticexyz/world/src/Module.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { InstalledModules } from "@latticexyz/world/src/codegen/index.sol";

import { ResourceId, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { KeysInTableHook } from "./KeysInTableHook.sol";
import { KeysInTable, KeysInTableTableId } from "./tables/KeysInTable.sol";
import { UsedKeysIndex, UsedKeysIndexTableId } from "./tables/UsedKeysIndex.sol";

/**
 * This module deploys a hook that is called when a value is set in the `sourceTableId`
 * provided in the install methods arguments. The hook keeps track of the keys that are in a given table.
 * This mapping is stored in a global table that is registered when the module is first installed.
 *
 * Note: if a table with composite keys is used, only the first key is indexed
 *
 * Note: this module currently only supports `installRoot` (via `World.installRootModule`).
 * TODO: add support for `install` (via `World.installModule`) by using `callFrom` with the `msgSender()`
 */
contract KeysInTableModule is Module {
  using WorldResourceIdInstance for ResourceId;

  // The KeysInTableHook is deployed once and infers the target table id
  // from the source table id (passed as argument to the hook methods)
  KeysInTableHook private immutable hook = new KeysInTableHook();

  function getName() public pure returns (bytes16) {
    return bytes16("keysInTable");
  }

  function installRoot(bytes memory args) public override {
    // Naive check to ensure this is only installed once
    // TODO: only revert if there's nothing to do
    if (InstalledModules.getModuleAddress(getName(), keccak256(args)) != address(0)) {
      revert Module_AlreadyInstalled();
    }

    // Extract source table id from args
    ResourceId sourceTableId = ResourceId.wrap(abi.decode(args, (bytes32)));

    IBaseWorld world = IBaseWorld(_world());

    // Initialize variable to reuse in low level calls
    bool success;
    bytes memory returnData;

    if (!ResourceIds._getExists(KeysInTableTableId)) {
      // Register the tables
      (success, returnData) = address(world).delegatecall(
        abi.encodeCall(
          world.registerTable,
          (
            KeysInTableTableId,
            KeysInTable.getFieldLayout(),
            KeysInTable.getKeySchema(),
            KeysInTable.getValueSchema(),
            KeysInTable.getKeyNames(),
            KeysInTable.getFieldNames()
          )
        )
      );
      if (!success) revertWithBytes(returnData);

      (success, returnData) = address(world).delegatecall(
        abi.encodeCall(
          world.registerTable,
          (
            UsedKeysIndexTableId,
            UsedKeysIndex.getFieldLayout(),
            UsedKeysIndex.getKeySchema(),
            UsedKeysIndex.getValueSchema(),
            UsedKeysIndex.getKeyNames(),
            UsedKeysIndex.getFieldNames()
          )
        )
      );
      if (!success) revertWithBytes(returnData);

      // Grant the hook access to the tables
      (success, returnData) = address(world).delegatecall(
        abi.encodeCall(world.grantAccess, (KeysInTableTableId, address(hook)))
      );
      if (!success) revertWithBytes(returnData);

      (success, returnData) = address(world).delegatecall(
        abi.encodeCall(world.grantAccess, (UsedKeysIndexTableId, address(hook)))
      );
      if (!success) revertWithBytes(returnData);
    }

    // Register a hook that is called when a value is set in the source table
    (success, returnData) = address(world).delegatecall(
      abi.encodeCall(
        world.registerStoreHook,
        (
          sourceTableId,
          hook,
          BEFORE_SET_RECORD | AFTER_SPLICE_STATIC_DATA | AFTER_SPLICE_DYNAMIC_DATA | BEFORE_DELETE_RECORD
        )
      )
    );
  }

  function install(bytes memory) public pure {
    revert Module_NonRootInstallNotSupported();
  }
}
