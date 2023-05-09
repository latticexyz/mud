// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { getKeysInTable } from "./getKeysInTable.sol";
import { hasKey } from "./hasKey.sol";

function query(bytes32[] memory tableIds) view returns (bytes32[][] memory keys) {
  // FIXME
}

function query(IStore store, bytes32[] memory tableIds) view returns (bytes32[][] memory keyTuples) {
  keyTuples = new bytes32[][](0);

  for (uint256 i; i < tableIds.length; i++) {
    bytes32[][] memory tableKeyTuples = getKeysInTable(store, tableIds[i]);

    bytes32[][] memory arr1 = keyTuples;
    bytes32[][] memory arr2 = tableKeyTuples;

    uint256 count;
    for (uint256 j; j < arr1.length; j++) {
      // if the current table has this key, ignore it
      if (!hasKey(store, tableIds[i], arr1[j])) {
        count++;
      }
    }

    bytes32[][] memory result = new bytes32[][](count + arr2.length);

    uint256 index;
    for (uint256 j; j < arr1.length; j++) {
      // if the current table has this key, ignore it
      if (!hasKey(store, tableIds[i], arr1[j])) {
        result[index] = arr1[j];
        index++;
      }
    }

    for (uint256 j; j < arr2.length; j++) {
      result[j + count] = arr2[j];
    }

    keyTuples = result;
  }
}
