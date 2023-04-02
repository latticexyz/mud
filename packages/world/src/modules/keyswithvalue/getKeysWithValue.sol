// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithValue } from "./tables/KeysWithValue.sol";
import { getTargetTableSelector } from "../utils/getTargetTableSelector.sol";

/**
 * Get a list of keys with the given value.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysWithValue(uint256 tableId, bytes memory value) view returns (bytes32[] memory keysWithValue) {
  // Get the corresponding reverse mapping table
  uint256 keysWithValueTableId = uint256(getTargetTableSelector(MODULE_NAMESPACE, tableId));

  // Get the keys with the given value
  keysWithValue = KeysWithValue.get(keysWithValueTableId, keccak256(value));
}

/**
 * Get a list of keys with the given value for the given store.
 */
function getKeysWithValue(
  IStore store,
  uint256 tableId,
  bytes memory value
) view returns (bytes32[] memory keysWithValue) {
  // Get the corresponding reverse mapping table
  uint256 keysWithValueTableId = uint256(getTargetTableSelector(MODULE_NAMESPACE, tableId));

  // Get the keys with the given value
  keysWithValue = KeysWithValue.get(store, keysWithValueTableId, keccak256(value));
}
