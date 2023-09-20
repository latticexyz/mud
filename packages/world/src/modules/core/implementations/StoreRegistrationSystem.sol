// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook, STORE_HOOK_INTERFACE_ID } from "@latticexyz/store/src/IStoreHook.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { System } from "../../../System.sol";
import { ResourceId, WorldResourceIdInstance } from "../../../WorldResourceId.sol";
import { Resource } from "../../../common.sol";
import { ROOT_NAMESPACE, ROOT_NAME } from "../../../constants.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { requireInterface } from "../../../requireInterface.sol";
import { revertWithBytes } from "../../../revertWithBytes.sol";
import { WorldContextProvider } from "../../../WorldContext.sol";
import { NamespaceOwner } from "../../../tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../../tables/ResourceAccess.sol";
import { IWorldErrors } from "../../../interfaces/IWorldErrors.sol";

import { ResourceType } from "../tables/ResourceType.sol";
import { SystemHooks } from "../tables/SystemHooks.sol";
import { SystemRegistry } from "../tables/SystemRegistry.sol";
import { Systems } from "../tables/Systems.sol";
import { FunctionSelectors } from "../tables/FunctionSelectors.sol";

import { CORE_SYSTEM_NAME } from "../constants.sol";

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
    if (tableId.getName() == ROOT_NAME) revert InvalidResourceId(tableId, tableId.toString());

    // If the namespace doesn't exist yet, register it
    ResourceId namespaceId = tableId.getNamespaceId();
    if (ResourceType._get(ResourceId.unwrap(namespaceId)) == Resource.NONE) {
      // Since this is a root system, we're in the context of the World contract already,
      // so we can use delegatecall to register the namespace
      (bool success, bytes memory data) = address(this).delegatecall(
        abi.encodeCall(WorldRegistrationSystem.registerNamespace, (namespaceId))
      );
      if (!success) revertWithBytes(data);
    } else {
      // otherwise require caller to own the namespace
      AccessControl.requireOwner(namespaceId, _msgSender());
    }

    // Require no resource to exist at this selector yet
    if (ResourceType._get(ResourceId.unwrap(tableId)) != Resource.NONE) {
      revert ResourceExists(tableId, tableId.toString());
    }

    // Store the table resource type
    ResourceType._set(ResourceId.unwrap(tableId), Resource.TABLE);

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
