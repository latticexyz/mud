// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook, STORE_HOOK_INTERFACE_ID } from "@latticexyz/store/src/IStoreHook.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { System } from "../../../System.sol";
import { ResourceSelector } from "../../../ResourceSelector.sol";
import { Resource } from "../../../common.sol";
import { ROOT_NAMESPACE, ROOT_NAME } from "../../../constants.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { requireInterface } from "../../../requireInterface.sol";
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
  using ResourceSelector for bytes32;

  /**
   * Register a table with the given config
   */
  function registerTable(
    bytes32 resourceSelector,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) public virtual {
    // Require the name to not be the namespace's root name
    if (resourceSelector.getName() == ROOT_NAME) revert InvalidSelector(resourceSelector.toString());

    // If the namespace doesn't exist yet, register it
    bytes16 namespace = resourceSelector.getNamespace();
    if (ResourceType._get(namespace) == Resource.NONE) {
      // We can't call IBaseWorld(this).registerNamespace directly because it would be handled like
      // an external call, so msg.sender would be the address of the World contract
      (address systemAddress, ) = Systems._get(ResourceSelector.from(ROOT_NAMESPACE, CORE_SYSTEM_NAME));
      WorldContextProvider.delegatecallWithContextOrRevert({
        msgSender: _msgSender(),
        msgValue: 0,
        target: systemAddress,
        funcSelectorAndArgs: abi.encodeWithSelector(WorldRegistrationSystem.registerNamespace.selector, namespace)
      });
    } else {
      // otherwise require caller to own the namespace
      AccessControl.requireOwner(namespace, _msgSender());
    }

    // Require no resource to exist at this selector yet
    if (ResourceType._get(resourceSelector) != Resource.NONE) {
      revert ResourceExists(resourceSelector.toString());
    }

    // Store the table resource type
    ResourceType._set(resourceSelector, Resource.TABLE);

    // Register the table
    StoreCore.registerTable(resourceSelector, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
  }

  /**
   * Register a hook for the given tableId.
   * Requires the caller to own the namespace.
   */
  function registerStoreHook(bytes32 tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) public virtual {
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
  function unregisterStoreHook(bytes32 tableId, IStoreHook hookAddress) public virtual {
    // Require caller to own the namespace
    AccessControl.requireOwner(tableId, _msgSender());

    // Unregister the hook
    StoreCore.unregisterStoreHook(tableId, hookAddress);
  }
}
