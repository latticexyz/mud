// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { getKeysInTable } from "./getKeysInTable.sol";
import { hasKey } from "./hasKey.sol";

function union(bytes32[] memory tableIds) view returns (bytes32[][] memory keyTuples) {
  for (uint256 i; i < tableIds.length; i++) {
    bytes32[][] memory tableKeyTuples = getKeysInTable(tableIds[i]);

    uint256 index;
    for (uint256 j; j < keyTuples.length; j++) {
      // if the current table does not have key, include it
      if (!hasKey(tableIds[i], keyTuples[j])) {
        index++;
      }
    }

    bytes32[][] memory result = new bytes32[][](index + tableKeyTuples.length);

    index = 0;
    for (uint256 j; j < keyTuples.length; j++) {
      // if the current table does not have key, include it
      if (!hasKey(tableIds[i], keyTuples[j])) {
        result[index] = keyTuples[j];
        index++;
      }
    }

    for (uint256 j; j < tableKeyTuples.length; j++) {
      result[j + index] = tableKeyTuples[j];
    }

    keyTuples = result;
  }
}

function union(IStore store, bytes32[] memory tableIds) view returns (bytes32[][] memory keyTuples) {
  for (uint256 i; i < tableIds.length; i++) {
    bytes32[][] memory tableKeyTuples = getKeysInTable(store, tableIds[i]);

    uint256 index;
    for (uint256 j; j < keyTuples.length; j++) {
      // if the current table does not have key, include it
      if (!hasKey(store, tableIds[i], keyTuples[j])) {
        index++;
      }
    }

    bytes32[][] memory result = new bytes32[][](index + tableKeyTuples.length);

    index = 0;
    for (uint256 j; j < keyTuples.length; j++) {
      // if the current table does not have key, include it
      if (!hasKey(store, tableIds[i], keyTuples[j])) {
        result[index] = keyTuples[j];
        index++;
      }
    }

    for (uint256 j; j < tableKeyTuples.length; j++) {
      result[j + index] = tableKeyTuples[j];
    }

    keyTuples = result;
  }
}
