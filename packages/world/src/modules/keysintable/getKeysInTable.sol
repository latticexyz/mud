// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { KeysInTable } from "./tables/KeysInTable.sol";
import { UsedKeysIndex } from "./tables/UsedKeysIndex.sol";

/**
 * Get a list of keys in the given table.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysInTable(bytes32 tableId) view returns (bytes32[][] memory keysInTable) {
  // Get the keys with the given table
  bytes32[] memory keysInTableRaw = KeysInTable.getKeys(tableId);

  keysInTable = new bytes32[][](keysInTableRaw.length);

  for (uint256 i; i < keysInTableRaw.length; i++) {
    keysInTable[i] = new bytes32[](1);
    keysInTable[i][0] = keysInTableRaw[i];
  }
}

/**
 * Get a list of keys in the given table for the given store.
 */
function getKeysInTable(IStore store, bytes32 tableId) view returns (bytes32[][] memory keysInTable) {
  // Get the keys with the given table
  bytes32[] memory keysInTableRaw = KeysInTable.getKeys(store, tableId);

  keysInTable = new bytes32[][](keysInTableRaw.length);

  for (uint256 i; i < keysInTableRaw.length; i++) {
    keysInTable[i] = new bytes32[](1);
    keysInTable[i][0] = keysInTableRaw[i];
  }
}

/**
 * Get whether the key is in the given table.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function hasKey(bytes32 tableId, bytes32[] memory key) view returns (bool) {
  bytes32 keysHash = keccak256(abi.encode(key));

  return UsedKeysIndex.getHas(tableId, keysHash);
}

/**
 * Get whether the key is in the given table for the given store.
 */
function hasKey(IStore store, bytes32 tableId, bytes32[] memory key) view returns (bool) {
  bytes32 keysHash = keccak256(abi.encode(key));

  return UsedKeysIndex.getHas(store, tableId, keysHash);
}
