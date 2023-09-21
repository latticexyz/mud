// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { KeysInTable } from "./tables/KeysInTable.sol";
import { UsedKeysIndex } from "./tables/UsedKeysIndex.sol";

/**
 * Note: if a table with composite keys is used, only the first five keys of the tuple are indexed
 */
contract KeysInTableHook is StoreHook {
  function handleSet(ResourceId tableId, bytes32[] memory keyTuple) internal {
    bytes32 keysHash = keccak256(abi.encode(keyTuple));

    // If the keyTuple has not yet been set in the table...
    if (!UsedKeysIndex.getHas(ResourceId.unwrap(tableId), keysHash)) {
      uint40 length = uint40(KeysInTable.lengthKeys0(ResourceId.unwrap(tableId)));

      // Push the keyTuple to the list of keys in this table
      if (keyTuple.length > 0) {
        KeysInTable.pushKeys0(ResourceId.unwrap(tableId), keyTuple[0]);
        if (keyTuple.length > 1) {
          KeysInTable.pushKeys1(ResourceId.unwrap(tableId), keyTuple[1]);
          if (keyTuple.length > 2) {
            KeysInTable.pushKeys2(ResourceId.unwrap(tableId), keyTuple[2]);
            if (keyTuple.length > 3) {
              KeysInTable.pushKeys3(ResourceId.unwrap(tableId), keyTuple[3]);
              if (keyTuple.length > 4) {
                KeysInTable.pushKeys4(ResourceId.unwrap(tableId), keyTuple[4]);
              }
            }
          }
        }
      }

      // Update the index to avoid duplicating this keyTuple in the array
      UsedKeysIndex.set(ResourceId.unwrap(tableId), keysHash, true, length);
    }
  }

  function onBeforeSetRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory,
    PackedCounter,
    bytes memory,
    FieldLayout
  ) public override {
    handleSet(tableId, keyTuple);
  }

  function onAfterSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48,
    uint40,
    bytes memory
  ) public override {
    handleSet(tableId, keyTuple);
  }

  function onAfterSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8,
    uint40,
    uint40,
    bytes memory,
    PackedCounter
  ) public override {
    handleSet(tableId, keyTuple);
  }

  function onBeforeDeleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout) public override {
    bytes32 keysHash = keccak256(abi.encode(keyTuple));
    (bool has, uint40 index) = UsedKeysIndex.get(ResourceId.unwrap(tableId), keysHash);

    // If the keyTuple was part of the table...
    if (has) {
      // Delete the index as the keyTuple is not in the table anymore
      UsedKeysIndex.deleteRecord(ResourceId.unwrap(tableId), keysHash);

      uint40 length = uint40(KeysInTable.lengthKeys0(ResourceId.unwrap(tableId)));

      if (length == 1) {
        // Delete the list of keys in this table
        KeysInTable.deleteRecord(ResourceId.unwrap(tableId));
      } else {
        if (keyTuple.length > 0) {
          bytes32[] memory lastKeyTuple = new bytes32[](keyTuple.length);

          bytes32 lastKey = KeysInTable.getItemKeys0(ResourceId.unwrap(tableId), length - 1);
          lastKeyTuple[0] = lastKey;

          // Remove the keyTuple from the list of keys in this table
          KeysInTable.updateKeys0(ResourceId.unwrap(tableId), index, lastKey);
          KeysInTable.popKeys0(ResourceId.unwrap(tableId));

          if (keyTuple.length > 1) {
            lastKey = KeysInTable.getItemKeys1(ResourceId.unwrap(tableId), length - 1);
            lastKeyTuple[1] = lastKey;

            KeysInTable.updateKeys1(ResourceId.unwrap(tableId), index, lastKey);
            KeysInTable.popKeys1(ResourceId.unwrap(tableId));

            if (keyTuple.length > 2) {
              lastKey = KeysInTable.getItemKeys2(ResourceId.unwrap(tableId), length - 1);
              lastKeyTuple[2] = lastKey;

              KeysInTable.updateKeys2(ResourceId.unwrap(tableId), index, lastKey);
              KeysInTable.popKeys2(ResourceId.unwrap(tableId));

              if (keyTuple.length > 3) {
                lastKey = KeysInTable.getItemKeys3(ResourceId.unwrap(tableId), length - 1);
                lastKeyTuple[3] = lastKey;

                KeysInTable.updateKeys3(ResourceId.unwrap(tableId), index, lastKey);
                KeysInTable.popKeys3(ResourceId.unwrap(tableId));

                if (keyTuple.length > 4) {
                  lastKey = KeysInTable.getItemKeys4(ResourceId.unwrap(tableId), length - 1);
                  lastKeyTuple[4] = lastKey;

                  KeysInTable.updateKeys4(ResourceId.unwrap(tableId), index, lastKey);
                  KeysInTable.popKeys4(ResourceId.unwrap(tableId));
                }
              }
            }
          }

          // Update the index of lastKeyTuple after swapping it with the deleted keyTuple
          bytes32 lastKeyHash = keccak256(abi.encode(lastKeyTuple));
          UsedKeysIndex.setIndex(ResourceId.unwrap(tableId), lastKeyHash, index);
        }
      }
    }
  }
}
