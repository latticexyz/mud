// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { KeysInTable } from "./tables/KeysInTable.sol";

/**
 * Get a list of keys in the given table.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysInTable(bytes32 tableId) view returns (bytes32[][] memory keyTuples) {
  // Get the keys with the given table

  /**
   * Note: this module does not yet support composite keys.
   * Therefore we create an array of key tuples but only fill the first entry.
   */
  bytes32[] memory keys = KeysInTable.getKeys0(tableId);

  keyTuples = new bytes32[][](keys.length);

  for (uint256 i; i < keys.length; i++) {
    keyTuples[i] = new bytes32[](1);
    keyTuples[i][0] = keys[i];
  }
}

/**
 * Get a list of keys in the given table for the given store.
 */
function getKeysInTable(IStore store, bytes32 tableId) view returns (bytes32[][] memory keyTuples) {
  // Get the keys with the given table
  bytes32[] memory keys = KeysInTable.getKeys0(store, tableId);

  keyTuples = new bytes32[][](keys.length);

  for (uint256 i; i < keys.length; i++) {
    keyTuples[i] = new bytes32[](1);
    keyTuples[i][0] = keys[i];
  }
}
