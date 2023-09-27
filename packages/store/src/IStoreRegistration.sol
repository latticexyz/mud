// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FieldLayout } from "./FieldLayout.sol";
import { Schema } from "./Schema.sol";
import { IStoreHook } from "./IStoreHook.sol";
import { ResourceId } from "./ResourceId.sol";

/**
 * The IStoreRegistration interface includes methods for managing table field layouts,
 * metadata, and hooks, which are usually called once in the setup phase of an application,
 * making them less performance critical than the  methods.
 */
interface IStoreRegistration {
  function registerTable(
    ResourceId tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) external;

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(ResourceId tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) external;

  // Unregister a hook for the given tableId
  function unregisterStoreHook(ResourceId tableId, IStoreHook hookAddress) external;
}
