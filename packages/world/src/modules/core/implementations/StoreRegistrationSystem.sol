// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { System } from "../../../System.sol";
import { ResourceSelector } from "../../../ResourceSelector.sol";
import { Resource } from "../../../Types.sol";
import { ROOT_NAMESPACE, ROOT_NAME } from "../../../constants.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { WorldContextProvider } from "../../../WorldContext.sol";
import { NamespaceOwner } from "../../../tables/NamespaceOwner.sol";
import { ResourceAccess } from "../../../tables/ResourceAccess.sol";
import { ISystemHook } from "../../../interfaces/ISystemHook.sol";
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
   * Register a table with given schema in the given namespace
   */
  function registerTable(
    bytes32 resourceSelector,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) public virtual {
    // Require the name to not be the namespace's root name
    if (resourceSelector.getName() == ROOT_NAME) revert InvalidSelector(resourceSelector.toString());

    // If the namespace doesn't exist yet, register it
    bytes16 namespace = resourceSelector.getNamespace();
    if (ResourceType.get(namespace) == Resource.NONE) {
      // We can't call IBaseWorld(this).registerSchema directly because it would be handled like
      // an external call, so msg.sender would be the address of the World contract
      (address systemAddress, ) = Systems.get(ResourceSelector.from(ROOT_NAMESPACE, CORE_SYSTEM_NAME));
      WorldContextProvider.delegatecallWithContextOrRevert({
        msgSender: _msgSender(),
        target: systemAddress,
        funcSelectorAndArgs: abi.encodeWithSelector(WorldRegistrationSystem.registerNamespace.selector, namespace)
      });
    } else {
      // otherwise require caller to own the namespace
      AccessControl.requireOwnerOrSelf(namespace, _msgSender());
    }

    // Require no resource to exist at this selector yet
    if (ResourceType.get(resourceSelector) != Resource.NONE) {
      revert ResourceExists(resourceSelector.toString());
    }

    // Store the table resource type
    ResourceType.set(resourceSelector, Resource.TABLE);

    // Register the table's schema
    StoreCore.registerTable(resourceSelector, keySchema, valueSchema, keyNames, fieldNames);
  }

  /**
   * Register a hook for the table at the given namepace and name.
   * Requires the caller to own the namespace.
   */
  function registerStoreHook(bytes32 tableId, IStoreHook hook) public virtual {
    // Require caller to own the namespace
    AccessControl.requireOwnerOrSelf(tableId, _msgSender());

    // Register the hook
    StoreCore.registerStoreHook(tableId, hook);
  }
}
