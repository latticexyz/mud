// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IStoreHook, STORE_HOOK_INTERFACE_ID } from "@latticexyz/store/src/IStoreHook.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { ResourceIds } from "@latticexyz/store/src/codegen/tables/ResourceIds.sol";

import { System } from "../../../System.sol";
import { ResourceId, WorldResourceIdInstance } from "../../../WorldResourceId.sol";
import { ROOT_NAME } from "../../../constants.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { requireInterface } from "../../../requireInterface.sol";
import { revertWithBytes } from "../../../revertWithBytes.sol";

import { Systems } from "../../../codegen/tables/Systems.sol";

import { IWorldErrors } from "../../../IWorldErrors.sol";

import { CORE_SYSTEM_ID } from "../constants.sol";

import { WorldRegistrationSystem } from "./WorldRegistrationSystem.sol";

/**
 * Functions related to registering table resources in the World.
 */
contract StoreRegistrationSystem is System, IWorldErrors {
  using WorldResourceIdInstance for ResourceId;

  /**
   * Register a table with the given config
   */
  function registerTable(
    ResourceId tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) public virtual {
    // Require the name to not be the namespace's root name
    if (tableId.getName() == ROOT_NAME) revert World_InvalidResourceId(tableId, tableId.toString());

    // If the namespace doesn't exist yet, register it
    ResourceId namespaceId = tableId.getNamespaceId();
    if (!ResourceIds._getExists(namespaceId)) {
      // Since this is a root system, we're in the context of the World contract already,
      // so we can use delegatecall to register the namespace
      (address coreSystemAddress, ) = Systems._get(CORE_SYSTEM_ID);
      (bool success, bytes memory data) = coreSystemAddress.delegatecall(
        abi.encodeCall(WorldRegistrationSystem.registerNamespace, (namespaceId))
      );
      if (!success) revertWithBytes(data);
    } else {
      // otherwise require caller to own the namespace
      AccessControl.requireOwner(namespaceId, _msgSender());
    }

    // Register the table
    StoreCore.registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
  }

  /**
   * Register a hook for the given tableId.
   * Requires the caller to own the namespace.
   */
  function registerStoreHook(ResourceId tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) public virtual {
    // Require the hook to implement the store hook interface
    requireInterface(address(hookAddress), STORE_HOOK_INTERFACE_ID);

    // Require caller to own the namespace
    AccessControl.requireOwner(tableId, _msgSender());

    // Register the hook
    StoreCore.registerStoreHook(tableId, hookAddress, enabledHooksBitmap);
  }

  /**
   * Unregister a hook for the given tableId.
   * Requires the caller to own the namespace.
   */
  function unregisterStoreHook(ResourceId tableId, IStoreHook hookAddress) public virtual {
    // Require caller to own the namespace
    AccessControl.requireOwner(tableId, _msgSender());

    // Unregister the hook
    StoreCore.unregisterStoreHook(tableId, hookAddress);
  }
}
