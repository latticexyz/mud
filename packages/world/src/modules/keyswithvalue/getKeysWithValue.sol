// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithValue } from "./tables/KeysWithValue.sol";

/**
 * Note: this module does not yet support composite keys.
 * Therefore we return an array of key tuples but only populate the first entry in each.
 */

/**
 * Get a list of keys with the given value.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysWithValue(bytes32 tableId, bytes memory value) view returns (bytes32[][] memory keyTuples) {
  bytes32[] memory keyTuplesFlat = KeysWithValue.get(tableId, keccak256(value));

  keyTuples = new bytes32[][](keyTuplesFlat.length);

  for (uint256 i; i < keyTuplesFlat.length; i++) {
    keyTuples[i] = new bytes32[](1);
    keyTuples[i][0] = keyTuplesFlat[i];
  }
}

/**
 * Get a list of keys with the given value for the given store.
 */
function getKeysWithValue(
  IStore store,
  bytes32 tableId,
  bytes memory value
) view returns (bytes32[][] memory keyTuples) {
  bytes32[] memory keyTuplesFlat = KeysWithValue.get(store, tableId, keccak256(value));

  keyTuples = new bytes32[][](keyTuplesFlat.length);

  for (uint256 i; i < keyTuplesFlat.length; i++) {
    keyTuples[i] = new bytes32[](1);
    keyTuples[i][0] = keyTuplesFlat[i];
  }
}
