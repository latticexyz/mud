// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { getKeysInTable } from "./getKeysInTable.sol";
import { hasKey } from "./hasKey.sol";
import { ArrayLib } from "../utils/ArrayLib.sol";

function query(bytes32[] memory tableIds) view returns (bytes32[][] memory keys) {
  keys = getKeysInTable(tableIds[0]);
}

function query(IStore store, bytes32[] memory tableIds) view returns (bytes32[][] memory keys) {
  keys = getKeysInTable(store, tableIds[0]);

  for (uint256 i = 1; i < tableIds.length; i++) {
    for (uint256 j; j < keys.length; j++) {
      if (!hasKey(store, tableIds[i], keys[j])) {
        // do something
      }
    }
  }
}
