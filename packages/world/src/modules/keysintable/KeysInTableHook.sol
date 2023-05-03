// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";

import { ResourceSelector } from "../../ResourceSelector.sol";

import { KeysInTable, KeysInTableTableId } from "./tables/KeysInTable.sol";
import { UsedKeysIndex } from "./tables/UsedKeysIndex.sol";
import { ArrayLib } from "../utils/ArrayLib.sol";

/**
 * Note: if a table with composite keys is used, only the first key is indexed
 */
contract KeysInTableHook is IStoreHook {
  using ArrayLib for bytes32[];
  using ResourceSelector for bytes32;

  function handleSet(bytes32 tableId, bytes32[] memory key) internal {
    bytes32 keysHash = keccak256(abi.encode(key));

    // If the key has not yet been set in the table...
    if (!UsedKeysIndex.getHas(tableId, keysHash)) {
      uint32 length = KeysInTable.getLength(tableId);

      // Push the key to the list of keys in this table
      KeysInTable.pushKeys(tableId, key[0]);
      KeysInTable.setLength(tableId, length + 1);

      // Update the index to avoid duplicating this key in the array
      UsedKeysIndex.set(tableId, keysHash, true, length);
    }
  }

  function onSetRecord(bytes32 table, bytes32[] memory key, bytes memory) public {
    handleSet(table, key);
  }

  function onBeforeSetField(bytes32 table, bytes32[] memory key, uint8, bytes memory) public {}

  function onAfterSetField(bytes32 table, bytes32[] memory key, uint8, bytes memory) public {
    handleSet(table, key);
  }

  function onDeleteRecord(bytes32 tableId, bytes32[] memory key) public {
    bytes32 keysHash = keccak256(abi.encode(key));
    (bool has, uint32 index) = UsedKeysIndex.get(tableId, keysHash);

    // If the key has not been set in the table...
    if (has) {
      uint32 length = KeysInTable.getLength(tableId);
      bytes32 lastKey = KeysInTable.getKeys(tableId)[length - 1];

      // Remove the key from the list of keys in this table
      KeysInTable.updateKeys(tableId, index, lastKey);
      KeysInTable.popKeys(tableId);

      KeysInTable.setLength(tableId, length - 1);

      // Delete the index as the key is not in the table
      UsedKeysIndex.deleteRecord(tableId, keysHash);
    }
  }
}
