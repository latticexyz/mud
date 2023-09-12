// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { KeysInTable } from "./tables/KeysInTable.sol";
import { UsedKeysIndex } from "./tables/UsedKeysIndex.sol";
import { KeysInTableTableId, UsedKeysIndexTableId } from "./constants.sol";

/**
 * Note: if a table with composite keys is used, only the first key is indexed
 */
contract KeysInTableHook is IStoreHook {
  function handleSet(bytes32 tableId, bytes32[] memory key) internal {
    bytes32 keysHash = keccak256(abi.encode(key));

    // If the key has not yet been set in the table...
    if (!UsedKeysIndex.getHas(UsedKeysIndexTableId, tableId, keysHash)) {
      uint40 length = uint40(KeysInTable.lengthKeys0(KeysInTableTableId, tableId));

      // Push the key to the list of keys in this table
      if (key.length > 0) {
        KeysInTable.pushKeys0(KeysInTableTableId, tableId, key[0]);
        if (key.length > 1) {
          KeysInTable.pushKeys1(KeysInTableTableId, tableId, key[1]);
          if (key.length > 2) {
            KeysInTable.pushKeys2(KeysInTableTableId, tableId, key[2]);
            if (key.length > 3) {
              KeysInTable.pushKeys3(KeysInTableTableId, tableId, key[3]);
              if (key.length > 4) {
                KeysInTable.pushKeys4(KeysInTableTableId, tableId, key[4]);
              }
            }
          }
        }
      }

      // Update the index to avoid duplicating this key in the array
      UsedKeysIndex.set(UsedKeysIndexTableId, tableId, keysHash, true, length);
    }
  }

  function onBeforeSetRecord(bytes32 table, bytes32[] memory key, bytes memory, Schema) public {
    handleSet(table, key);
  }

  function onAfterSetRecord(bytes32 table, bytes32[] memory key, bytes memory, Schema) public {
    // NOOP
  }

  function onBeforeSetField(bytes32 table, bytes32[] memory key, uint8, bytes memory, Schema) public {
    // NOOP
  }

  function onAfterSetField(bytes32 table, bytes32[] memory key, uint8, bytes memory, Schema) public {
    handleSet(table, key);
  }

  function onBeforeDeleteRecord(bytes32 tableId, bytes32[] memory key, Schema) public {
    bytes32 keysHash = keccak256(abi.encode(key));
    (bool has, uint40 index) = UsedKeysIndex.get(UsedKeysIndexTableId, tableId, keysHash);

    // If the key was part of the table...
    if (has) {
      // Delete the index as the key is not in the table
      UsedKeysIndex.deleteRecord(UsedKeysIndexTableId, tableId, keysHash);

      uint40 length = uint40(KeysInTable.lengthKeys0(KeysInTableTableId, tableId));

      if (length == 1) {
        // Delete the list of keys in this table
        KeysInTable.deleteRecord(KeysInTableTableId, tableId);
      } else {
        if (key.length > 0) {
          bytes32[] memory lastKeyTuple = new bytes32[](key.length);

          bytes32 lastKey = KeysInTable.getItemKeys0(KeysInTableTableId, tableId, length - 1);
          lastKeyTuple[0] = lastKey;

          // Remove the key from the list of keys in this table
          KeysInTable.updateKeys0(KeysInTableTableId, tableId, index, lastKey);
          KeysInTable.popKeys0(KeysInTableTableId, tableId);

          if (key.length > 1) {
            lastKey = KeysInTable.getItemKeys1(KeysInTableTableId, tableId, length - 1);
            lastKeyTuple[1] = lastKey;

            // Remove the key from the list of keys in this table
            KeysInTable.updateKeys1(KeysInTableTableId, tableId, index, lastKey);
            KeysInTable.popKeys1(KeysInTableTableId, tableId);

            if (key.length > 2) {
              lastKey = KeysInTable.getItemKeys2(KeysInTableTableId, tableId, length - 1);
              lastKeyTuple[2] = lastKey;

              // Swap and pop the key from the list of keys in this table
              KeysInTable.updateKeys2(KeysInTableTableId, tableId, index, lastKey);
              KeysInTable.popKeys2(KeysInTableTableId, tableId);

              if (key.length > 3) {
                lastKey = KeysInTable.getItemKeys3(KeysInTableTableId, tableId, length - 1);
                lastKeyTuple[3] = lastKey;

                // Remove the key from the list of keys in this table
                KeysInTable.updateKeys3(KeysInTableTableId, tableId, index, lastKey);
                KeysInTable.popKeys3(KeysInTableTableId, tableId);

                if (key.length > 4) {
                  lastKey = KeysInTable.getItemKeys4(KeysInTableTableId, tableId, length - 1);
                  lastKeyTuple[4] = lastKey;

                  // Remove the key from the list of keys in this table
                  KeysInTable.updateKeys4(KeysInTableTableId, tableId, index, lastKey);
                  KeysInTable.popKeys4(KeysInTableTableId, tableId);
                }
              }
            }
          }

          // Update the index of lastKey after swapping it with the deleted key
          bytes32 lastKeyHash = keccak256(abi.encode(lastKeyTuple));
          UsedKeysIndex.setIndex(UsedKeysIndexTableId, tableId, lastKeyHash, index);
        }
      }
    }
  }

  function onAfterDeleteRecord(bytes32 table, bytes32[] memory key, Schema valueSchema) public {
    // NOOP
  }
}
