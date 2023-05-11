// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { InTableKeys } from "./tables/InTableKeys.sol";

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
function getKeysInTable(bytes32 tableId) view returns (bytes32[][] memory keyTuples) {
  bytes32[] memory keyTuplesFlat = InTableKeys.get(tableId);

  keyTuples = new bytes32[][](keyTuplesFlat.length);

  for (uint256 i; i < keyTuplesFlat.length; i++) {
    keyTuples[i] = new bytes32[](1);
    keyTuples[i][0] = keyTuplesFlat[i];
  }
}

/**
 * Get a list of keys in the given table for the given store.
 */
function getKeysInTable(IStore store, bytes32 tableId) view returns (bytes32[][] memory keyTuples) {
  bytes32[] memory keyTuplesFlat = InTableKeys.get(store, tableId);

  keyTuples = new bytes32[][](keyTuplesFlat.length);

  for (uint256 i; i < keyTuplesFlat.length; i++) {
    keyTuples[i] = new bytes32[](1);
    keyTuples[i][0] = keyTuplesFlat[i];
  }
}
