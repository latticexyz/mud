// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { BEFORE_SET_RECORD, BEFORE_SPLICE_STATIC_DATA, AFTER_SPLICE_STATIC_DATA, BEFORE_SPLICE_DYNAMIC_DATA, AFTER_SPLICE_DYNAMIC_DATA, BEFORE_DELETE_RECORD } from "@latticexyz/store/src/storeHookTypes.sol";
import { Module } from "@latticexyz/world/src/Module.sol";

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { InstalledModules } from "@latticexyz/world/src/codegen/index.sol";

import { WorldContextConsumer } from "@latticexyz/world/src/WorldContext.sol";
import { ResourceId, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { revertWithBytes } from "@latticexyz/world/src/revertWithBytes.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithValueHook } from "./KeysWithValueHook.sol";
import { KeysWithValue } from "./tables/KeysWithValue.sol";
import { getTargetTableId } from "./getTargetTableId.sol";

/**
 * This module deploys a hook that is called when a value is set in the `sourceTableId`
 * provided in the install methods arguments. The hook keeps track of the keys that map to a given value.
 * from value to list of keys with this value. This mapping is stored in a table registered
 * by the module at the `targetTableId` provided in the install methods arguments.
 *
 * Note: if a table with composite keys is used, only the first key is indexed
 *
 * Note: this module currently only supports `installRoot` (via `World.installRootModule`).
 * TODO: add support for `install` (via `World.installModule`) by using `callFrom` with the `msgSender()`
 */
contract KeysWithValueModule is Module {
  using WorldResourceIdInstance for ResourceId;

  // The KeysWithValueHook is deployed once and infers the target table id
  // from the source table id (passed as argument to the hook methods)
  KeysWithValueHook private immutable hook = new KeysWithValueHook();

  function getName() public pure returns (bytes16) {
    return bytes16("index");
  }

  function installRoot(bytes memory args) public {
    // Naive check to ensure this is only installed once
    // TODO: only revert if there's nothing to do
    if (InstalledModules.getModuleAddress(getName(), keccak256(args)) != address(0)) {
      revert Module_AlreadyInstalled();
    }

    // Extract source table id from args
    ResourceId sourceTableId = ResourceId.wrap(abi.decode(args, (bytes32)));
    ResourceId targetTableSelector = getTargetTableId(MODULE_NAMESPACE, sourceTableId);

    IBaseWorld world = IBaseWorld(_world());

    // Register the target table
    (bool success, bytes memory returnData) = address(world).delegatecall(
      abi.encodeCall(
        world.registerTable,
        (
          targetTableSelector,
          KeysWithValue.getFieldLayout(),
          KeysWithValue.getKeySchema(),
          KeysWithValue.getValueSchema(),
          KeysWithValue.getKeyNames(),
          KeysWithValue.getFieldNames()
        )
      )
    );

    // Grant the hook access to the target table
    (success, returnData) = address(world).delegatecall(
      abi.encodeCall(world.grantAccess, (targetTableSelector, address(hook)))
    );

    if (!success) revertWithBytes(returnData);

    // Register a hook that is called when a value is set in the source table
    (success, returnData) = address(world).delegatecall(
      abi.encodeCall(
        world.registerStoreHook,
        (
          sourceTableId,
          hook,
          BEFORE_SET_RECORD |
            BEFORE_SPLICE_STATIC_DATA |
            AFTER_SPLICE_STATIC_DATA |
            BEFORE_SPLICE_DYNAMIC_DATA |
            AFTER_SPLICE_DYNAMIC_DATA |
            BEFORE_DELETE_RECORD
        )
      )
    );
    if (!success) revertWithBytes(returnData);
  }

  function install(bytes memory) public pure {
    revert Module_NonRootInstallNotSupported();
  }
}
