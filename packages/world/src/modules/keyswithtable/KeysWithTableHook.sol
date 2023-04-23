// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";

import { ResourceSelector } from "../../ResourceSelector.sol";

import { MODULE_NAMESPACE, USED_KEYS_NAMESPACE } from "./constants.sol";
import { KeysWithTable } from "./tables/KeysWithTable.sol";
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
contract KeysWithTableHook is IStoreHook {
  using ArrayLib for bytes32[];
  using ResourceSelector for bytes32;

  function onSetRecord(bytes32 table, bytes32[] memory key, bytes memory data) public {
    bytes32 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, table);
    bytes32 targetTableIdUsed = getTargetTableSelector(USED_KEYS_NAMESPACE, table);

    bytes32 keysHash = keccak256(abi.encode(key));

    // If the key not has yet been set in the table...
    if (!UsedKeysIndex.get(targetTableIdUsed, keysHash)) {
      // Push the key to the list of keys in this table
      KeysWithTable.push(targetTableId, key[0]);

      UsedKeysIndex.set(targetTableIdUsed, keysHash, true);
    }
  }

  function onBeforeSetField(bytes32 table, bytes32[] memory key, uint8, bytes memory) public {}

  function onAfterSetField(bytes32 table, bytes32[] memory key, uint8, bytes memory) public {
    bytes32 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, table);
    bytes32 targetTableIdUsed = getTargetTableSelector(USED_KEYS_NAMESPACE, table);

    bytes32 keysHash = keccak256(abi.encode(key));

    // If the key not has yet been set in the table...
    if (!UsedKeysIndex.get(targetTableIdUsed, keysHash)) {
      // Push the key to the list of keys in this table
      KeysWithTable.push(targetTableId, key[0]);

      UsedKeysIndex.set(targetTableIdUsed, keysHash, true);
    }
  }

  function onDeleteRecord(bytes32 table, bytes32[] memory key) public {
    // Remove the key from the list of keys in this table
    bytes32 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, table);
    bytes32 targetTableIdUsed = getTargetTableSelector(USED_KEYS_NAMESPACE, table);

    bytes32[] memory keysWithTable = KeysWithTable.get(targetTableId);

    KeysWithTable.set(targetTableId, keysWithTable.filter(key[0]));

    bytes32 keysHash = keccak256(abi.encode(key));
    UsedKeysIndex.set(targetTableIdUsed, keysHash, false);
  }
}
