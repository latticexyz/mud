// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { getKeysInTable } from "./getKeysInTable.sol";
import { getKeysWithValue } from "../keyswithvalue/getKeysWithValue.sol";
import { hasKey } from "./hasKey.sol";
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

function intersection(IStore store, QueryFragment[] memory fragments) view returns (bytes32[][] memory keyTuples) {
  keyTuples = getKeysInTable(store, fragments[0].tableId);

  for (uint256 i = 1; i < fragments.length; i++) {
    uint256 index;
    for (uint256 j; j < keyTuples.length; j++) {
      bool on = (fragments[i].queryType == QueryType.Has && hasKey(store, fragments[i].tableId, keyTuples[j])) ||
        (fragments[i].queryType == QueryType.Not && !hasKey(store, fragments[i].tableId, keyTuples[j]));
      if (on) {
        index++;
      }
    }

    bytes32[][] memory result = new bytes32[][](index);

    index = 0;
    for (uint256 j; j < keyTuples.length; j++) {
      bool on = (fragments[i].queryType == QueryType.Has && hasKey(store, fragments[i].tableId, keyTuples[j])) ||
        (fragments[i].queryType == QueryType.Not && !hasKey(store, fragments[i].tableId, keyTuples[j]));
      if (on) {
        result[index] = keyTuples[j];
        index++;
      }
    }

    keyTuples = result;
  }
}

function intersectionBare(IStore store, QueryFragment[] memory fragments) view returns (bytes32[][] memory keyTuples) {
  keyTuples = getKeysInTable(store, fragments[0].tableId);

  for (uint256 i = 1; i < fragments.length; i++) {
    bytes32[][] memory tableKeyTuples = getKeysInTable(store, fragments[i].tableId);
    bytes32[][] memory valueKeyTuples = ArrayLib.unflatten(
      getKeysWithValue(store, fragments[i].tableId, fragments[i].value)
    );

    uint256 index;
    for (uint256 j; j < keyTuples.length; j++) {
      QueryType queryType = fragments[i].queryType;

      bool on = (queryType == QueryType.Has && ArrayLib.includes(tableKeyTuples, keyTuples[j])) ||
        (queryType == QueryType.Not && !ArrayLib.includes(tableKeyTuples, keyTuples[j])) ||
        (queryType == QueryType.HasValue && ArrayLib.includes(valueKeyTuples, keyTuples[j])) ||
        (queryType == QueryType.NotValue && !ArrayLib.includes(valueKeyTuples, keyTuples[j]));
      if (on) {
        index++;
      }
    }

    bytes32[][] memory result = new bytes32[][](index);

    index = 0;
    for (uint256 j; j < keyTuples.length; j++) {
      QueryType queryType = fragments[i].queryType;

      bool on = (queryType == QueryType.Has && ArrayLib.includes(tableKeyTuples, keyTuples[j])) ||
        (queryType == QueryType.Not && !ArrayLib.includes(tableKeyTuples, keyTuples[j])) ||
        (queryType == QueryType.HasValue && ArrayLib.includes(valueKeyTuples, keyTuples[j])) ||
        (queryType == QueryType.NotValue && !ArrayLib.includes(valueKeyTuples, keyTuples[j]));
      if (on) {
        result[index] = keyTuples[j];
        index++;
      }
    }

    keyTuples = result;
  }
}
