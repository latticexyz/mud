// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { KeysInTable } from "./tables/KeysInTable.sol";

/**
 * Note: this module does not yet support composite keys.
 * Therefore we return an array of key tuples but only populate the first entry in each.
 */

/**
 * Get a list of keys in the given table.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysInTable(bytes32 tableId) view returns (bytes32[][] memory keysInTable) {
  bytes32[] memory keysInTableFlat = KeysInTable.getKeys(tableId);

  keysInTable = new bytes32[][](keysInTableFlat.length);

  for (uint256 i; i < keysInTableFlat.length; i++) {
    keysInTable[i] = new bytes32[](1);
    keysInTable[i][0] = keysInTableFlat[i];
  }
}

/**
 * Get a list of keys in the given table for the given store.
 */
function getKeysInTable(IStore store, bytes32 tableId) view returns (bytes32[][] memory keysInTable) {
  bytes32[] memory keysInTableFlat = KeysInTable.getKeys(store, tableId);

  keysInTable = new bytes32[][](keysInTableFlat.length);

  for (uint256 i; i < keysInTableFlat.length; i++) {
    keysInTable[i] = new bytes32[](1);
    keysInTable[i][0] = keysInTableFlat[i];
  }
}
