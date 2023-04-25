// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysInTable } from "./tables/KeysInTable.sol";
import { getTargetTableSelector } from "../utils/getTargetTableSelector.sol";

/**
 * Get a list of keys in the given table.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysInTable(bytes32 tableId) view returns (bytes32[] memory keysInTable) {
  // Get the corresponding reverse mapping table
  bytes32 keysInTableTableId = getTargetTableSelector(MODULE_NAMESPACE, tableId);

  // Get the keys with the given value
  keysInTable = KeysInTable.get(keysInTableTableId);
}

/**
 * Get a list of keys in the given table for the given store.
 */
function getKeysInTable(IStore store, bytes32 tableId) view returns (bytes32[] memory keysInTable) {
  // Get the corresponding reverse mapping table
  bytes32 keysInTableTableId = getTargetTableSelector(MODULE_NAMESPACE, tableId);

  // Get the keys with the given table
  keysInTable = KeysInTable.get(store, keysInTableTableId);
}
