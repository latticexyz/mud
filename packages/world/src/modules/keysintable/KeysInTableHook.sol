// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";

import { KeysInTable } from "./tables/KeysInTable.sol";
import { UsedKeysIndex } from "./tables/UsedKeysIndex.sol";
import { KeysInTableDynamicFieldIndex } from "./KeysInTableDynamicFieldIndex.sol";

/**
 * Note: if a table with composite keys is used, only the first key is indexed
 */
contract KeysInTableHook is IStoreHook {
  function handleSet(bytes32 tableId, bytes32[] memory key) internal {
    bytes32 keysHash = keccak256(abi.encode(key));

    // If the key has not yet been set in the table...
    if (!UsedKeysIndex.getHas(tableId, keysHash)) {
      uint40 length = uint40(KeysInTable.lengthKeyParts0(tableId));

      // Push the key to the list of keys in this table
      for (uint8 fieldIndex = 0; fieldIndex < key.length; fieldIndex++) {
        KeysInTableDynamicFieldIndex.pushKeyParts(fieldIndex, tableId, key[fieldIndex]);
      }

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
    (bool has, uint40 index) = UsedKeysIndex.get(tableId, keysHash);

    // If the key was part of the table...
    if (has) {
      // Delete the index as the key is not in the table
      UsedKeysIndex.deleteRecord(tableId, keysHash);

      uint40 length = uint40(KeysInTable.lengthKeyParts0(tableId));

      if (length == 1) {
        // Delete the list of keys in this table
        KeysInTable.deleteRecord(tableId);
      } else {
        bytes32[] memory lastKeyTuple = new bytes32[](key.length);

        for (uint8 fieldIndex = 0; fieldIndex < key.length; fieldIndex++) {
          bytes32 lastKey = KeysInTableDynamicFieldIndex.getItemKeyParts(fieldIndex, tableId, length - 1);
          lastKeyTuple[fieldIndex] = lastKey;

          // Remove the key from the list of keys in this table
          KeysInTableDynamicFieldIndex.updateKeyParts(fieldIndex, tableId, index, lastKey);
          KeysInTableDynamicFieldIndex.popKeyParts(fieldIndex, tableId);
        }

        // Update the index of lastKey after swapping it with the deleted key
        bytes32 lastKeyHash = keccak256(abi.encode(lastKeyTuple));
        UsedKeysIndex.setIndex(tableId, lastKeyHash, index);
      }
    }
  }
}
