// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithTable } from "./tables/KeysWithTable.sol";
import { getTargetTableSelector } from "../utils/getTargetTableSelector.sol";

/**
 * Get a list of keys in the given table.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysWithTable(uint256 tableId) view returns (bytes32[] memory keysWithTable) {
  // Get the corresponding reverse mapping table
  uint256 keysWithTableTableId = uint256(getTargetTableSelector(MODULE_NAMESPACE, tableId));

  // Get the keys with the given value
  keysWithTable = KeysWithTable.get(keysWithTableTableId);
}

/**
 * Get a list of keys in the given table for the given store.
 */
function getKeysWithTable(IStore store, uint256 tableId) view returns (bytes32[] memory keysWithTable) {
  // Get the corresponding reverse mapping table
  uint256 keysWithTableTableId = uint256(getTargetTableSelector(MODULE_NAMESPACE, tableId));

  // Get the keys with the given table
  keysWithTable = KeysWithTable.get(store, keysWithTableTableId);
}
