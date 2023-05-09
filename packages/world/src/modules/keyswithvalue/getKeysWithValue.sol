// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithValue } from "./tables/KeysWithValue.sol";

/**
 * Get a list of keys with the given value.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysWithValue(bytes32 tableId, bytes memory value) view returns (bytes32[] memory keysWithValue) {
  // Get the keys with the given value
  keysWithValue = KeysWithValue.getKeys(tableId, keccak256(value));
}

/**
 * Get a list of keys with the given value for the given store.
 */
function getKeysWithValue(
  IStore store,
  bytes32 tableId,
  bytes memory value
) view returns (bytes32[] memory keysWithValue) {
  // Get the keys with the given value
  keysWithValue = KeysWithValue.getKeys(store, tableId, keccak256(value));
}
