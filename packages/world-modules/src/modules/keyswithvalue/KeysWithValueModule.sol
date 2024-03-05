// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { BEFORE_SET_RECORD, BEFORE_SPLICE_STATIC_DATA, AFTER_SPLICE_STATIC_DATA, BEFORE_SPLICE_DYNAMIC_DATA, AFTER_SPLICE_DYNAMIC_DATA, BEFORE_DELETE_RECORD } from "@latticexyz/store/src/storeHookTypes.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

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

  function installRoot(bytes memory encodedArgs) public {
    // Naive check to ensure this is only installed once
    // TODO: only revert if there's nothing to do
    requireNotInstalled(__self, encodedArgs);

    // Extract source table id from args
    ResourceId sourceTableId = ResourceId.wrap(abi.decode(encodedArgs, (bytes32)));
    ResourceId targetTableId = getTargetTableId(MODULE_NAMESPACE, sourceTableId);

    IBaseWorld world = IBaseWorld(_world());

    // Register the target namespace if it doesn't exist yet
    if (!ResourceIds.getExists(targetTableId.getNamespaceId())) {
      (bool registrationSuccess, bytes memory registrationReturnData) = address(world).delegatecall(
        abi.encodeCall(world.registerNamespace, (targetTableId.getNamespaceId()))
      );
      if (!registrationSuccess) revertWithBytes(registrationReturnData);
    }

    // Register the target table
    (bool success, bytes memory returnData) = address(world).delegatecall(
      abi.encodeCall(
        world.registerTable,
        (
          targetTableId,
          KeysWithValue._fieldLayout,
          KeysWithValue._keySchema,
          KeysWithValue._valueSchema,
          KeysWithValue.getKeyNames(),
          KeysWithValue.getFieldNames()
        )
      )
    );

    if (!success) revertWithBytes(returnData);

    // Grant the hook access to the target table
    (success, returnData) = address(world).delegatecall(
      abi.encodeCall(world.grantAccess, (targetTableId, address(hook)))
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
