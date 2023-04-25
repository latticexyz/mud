// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";

import { ResourceSelector } from "../../ResourceSelector.sol";

import { MODULE_NAMESPACE, USED_KEYS_NAMESPACE } from "./constants.sol";
import { KeysInTable } from "./tables/KeysInTable.sol";
import { UsedKeysIndex } from "./tables/UsedKeysIndex.sol";
import { ArrayLib } from "../utils/ArrayLib.sol";
import { getTargetTableSelector } from "../utils/getTargetTableSelector.sol";

/**
 * This is a very naive and inefficient implementation for now.
 * We can optimize this by adding support for `setIndexOfField` in Store
 * and then replicate logic from solecs's Set.sol.
 * (See https://github.com/latticexyz/mud/issues/444)
 *
 * Note: if a table with composite keys is used, only the first key is indexed
 */
contract KeysInTableHook is IStoreHook {
  using ArrayLib for bytes32[];
  using ResourceSelector for bytes32;

  function blah(bytes32 table, bytes32[] memory key) internal {
    bytes32 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, table);
    bytes32 targetTableIdUsed = getTargetTableSelector(USED_KEYS_NAMESPACE, table);

    bytes32 keysHash = keccak256(abi.encode(key));

    // If the key not has yet been set in the table...
    if (!UsedKeysIndex.get(targetTableIdUsed, keysHash)) {
      // Push the key to the list of keys in this table
      KeysInTable.push(targetTableId, key[0]);

      UsedKeysIndex.set(targetTableIdUsed, keysHash, true);
    }
  }

  function onSetRecord(bytes32 table, bytes32[] memory key, bytes memory) public {
    blah(table, key);
  }

  function onBeforeSetField(bytes32 table, bytes32[] memory key, uint8, bytes memory) public {}

  function onAfterSetField(bytes32 table, bytes32[] memory key, uint8, bytes memory) public {
    blah(table, key);
  }

  function onDeleteRecord(bytes32 table, bytes32[] memory key) public {
    // Remove the key from the list of keys in this table
    bytes32 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, table);
    bytes32 targetTableIdUsed = getTargetTableSelector(USED_KEYS_NAMESPACE, table);

    bytes32[] memory keysInTable = KeysInTable.get(targetTableId);

    KeysInTable.set(targetTableId, keysInTable.filter(key[0]));

    bytes32 keysHash = keccak256(abi.encode(key));
    UsedKeysIndex.set(targetTableIdUsed, keysHash, false);
  }
}
