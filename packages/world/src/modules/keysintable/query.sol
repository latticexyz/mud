// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { getKeysInTable } from "./getKeysInTable.sol";
import { getKeysWithValue } from "../keyswithvalue/getKeysWithValue.sol";
import { ArrayLib } from "../utils/ArrayLib.sol";

enum QueryType {
  Has,
  Not,
  HasValue,
  NotValue
}

struct QueryFragment {
  QueryType queryType;
  bytes32 tableId;
  bytes value;
}

function passesQueryFragment(
  IStore store,
  bytes32[] memory keyTuple,
  QueryFragment memory fragment
) view returns (bool) {
  if (fragment.queryType == QueryType.Has) {
    // Key must be in given table
    return ArrayLib.includes(getKeysInTable(store, fragment.tableId), keyTuple);
  }

  if (fragment.queryType == QueryType.HasValue) {
    // Key must be have the given value
    return ArrayLib.includes(ArrayLib.unflatten(getKeysWithValue(store, fragment.tableId, fragment.value)), keyTuple);
  }

  if (fragment.queryType == QueryType.Not) {
    // Key must not be in given table
    return !ArrayLib.includes(getKeysInTable(store, fragment.tableId), keyTuple);
  }

  if (fragment.queryType == QueryType.NotValue) {
    // Key must not have the given value
    return !ArrayLib.includes(ArrayLib.unflatten(getKeysWithValue(store, fragment.tableId, fragment.value)), keyTuple);
  }

  return false;
}

/**
 * Execute the given query and return a list of keys
 * The first fragment should be Has or HasValue
 * @param fragments List of query fragments to execute
 * @return keyTuples List of keys matching the query
 */
function query(IStore store, QueryFragment[] memory fragments) view returns (bytes32[][] memory keyTuples) {
  // Create the first interim result
  keyTuples = fragments[0].queryType == QueryType.Has
    ? getKeysInTable(store, fragments[0].tableId)
    : ArrayLib.unflatten(getKeysWithValue(store, fragments[0].tableId, fragments[0].value));

  for (uint256 i = 1; i < fragments.length; i++) {
    bytes32[][] memory result = new bytes32[][](0);

    for (uint256 j; j < keyTuples.length; j++) {
      bool passes = passesQueryFragment(store, keyTuples[j], fragments[i]);
      if (passes) {
        // Increase the length of result array and add the new key
        uint256 length = result.length;

        bytes32[][] memory newResult = new bytes32[][](length + 1);
        for (uint256 k; k < length; k++) {
          newResult[k] = result[k];
        }
        result = newResult;

        result[length] = keyTuples[j];
      }
    }

    keyTuples = result;
  }
}
