// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { getKeysInTable } from "./getKeysInTable.sol";
import { hasKey } from "./hasKey.sol";

/**
 * Get a list of keys, without duplicates, in the given tables.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function query(bytes32[] memory tableIds) view returns (bytes32[][] memory keyTuples) {
  // FIXME
}

/**
 * Get a list of keys, without duplicates, in the given tables for the given store.
 */
function query(IStore store, bytes32[] memory tableIds) view returns (bytes32[][] memory keyTuples) {
  for (uint256 i; i < tableIds.length; i++) {
    bytes32[][] memory tableKeyTuples = getKeysInTable(store, tableIds[i]);

    uint256 count;
    for (uint256 j; j < keyTuples.length; j++) {
      // if the current table does not have key, include it
      if (!hasKey(store, tableIds[i], keyTuples[j])) {
        count++;
      }
    }

    bytes32[][] memory result = new bytes32[][](count + tableKeyTuples.length);

    uint256 index;
    for (uint256 j; j < keyTuples.length; j++) {
      // if the current table does not have key, include it
      if (!hasKey(store, tableIds[i], keyTuples[j])) {
        result[index] = keyTuples[j];
        index++;
      }
    }

    for (uint256 j; j < tableKeyTuples.length; j++) {
      result[j + count] = tableKeyTuples[j];
    }

    keyTuples = result;
  }
}
