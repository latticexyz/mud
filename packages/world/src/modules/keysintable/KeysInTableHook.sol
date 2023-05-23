// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";

import { KeysInTable } from "./tables/KeysInTable.sol";
import { UsedKeysIndex } from "./tables/UsedKeysIndex.sol";

/**
 * Note: if a table with composite keys is used, only the first key is indexed
 */
contract KeysInTableHook is IStoreHook {
  function handleSet(bytes32 tableId, bytes32[] memory key) internal {
    bytes32 keysHash = keccak256(abi.encode(key));

    // If the key has not yet been set in the table...
    if (!UsedKeysIndex.getHas(tableId, keysHash)) {
      uint256 length = KeysInTable.lengthKeys0(tableId);

      // Push the key to the list of keys in this table
      if (key.length > 0) {
        KeysInTable.pushKeys0(tableId, key[0]);
        if (key.length > 1) {
          KeysInTable.pushKeys1(tableId, key[1]);
          if (key.length > 2) {
            KeysInTable.pushKeys2(tableId, key[2]);
            if (key.length > 3) {
              KeysInTable.pushKeys3(tableId, key[3]);
              if (key.length > 4) {
                KeysInTable.pushKeys4(tableId, key[4]);
              }
            }
          }
        }
      }

      // Update the index to avoid duplicating this key in the array
      UsedKeysIndex.set(tableId, keysHash, true, uint32(length));
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

    // If the key was part of the table...
    if (has) {
      // Delete the index as the key is not in the table
      UsedKeysIndex.deleteRecord(tableId, keysHash);

      uint256 length = KeysInTable.lengthKeys0(tableId);

      if (length == 1) {
        // Delete the list of keys in this table
        KeysInTable.deleteRecord(tableId);
      } else {
        if (key.length > 0) {
          bytes32 lastKey = KeysInTable.getItemKeys0(tableId, length - 1);

          // Remove the key from the list of keys in this table
          KeysInTable.updateKeys0(tableId, index, lastKey);
          KeysInTable.popKeys0(tableId);

          if (key.length > 1) {
            lastKey = KeysInTable.getItemKeys1(tableId, length - 1);

            // Remove the key from the list of keys in this table
            KeysInTable.updateKeys1(tableId, index, lastKey);
            KeysInTable.popKeys1(tableId);

            if (key.length > 2) {
              lastKey = KeysInTable.getItemKeys2(tableId, length - 1);

              // Remove the key from the list of keys in this table
              KeysInTable.updateKeys2(tableId, index, lastKey);
              KeysInTable.popKeys2(tableId);

              if (key.length > 3) {
                lastKey = KeysInTable.getItemKeys3(tableId, length - 1);

                // Remove the key from the list of keys in this table
                KeysInTable.updateKeys3(tableId, index, lastKey);
                KeysInTable.popKeys3(tableId);

                if (key.length > 4) {
                  lastKey = KeysInTable.getItemKeys4(tableId, length - 1);

                  // Remove the key from the list of keys in this table
                  KeysInTable.updateKeys4(tableId, index, lastKey);
                  KeysInTable.popKeys4(tableId);
                }
              }
            }
          }
        }
      }
    }
  }
}
