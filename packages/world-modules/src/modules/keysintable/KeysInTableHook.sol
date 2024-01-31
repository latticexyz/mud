// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { KeysInTable } from "./tables/KeysInTable.sol";
import { UsedKeysIndex } from "./tables/UsedKeysIndex.sol";
import { KeysInTableDynamicFieldIndex } from "./KeysInTableDynamicFieldIndex.sol";

/**
 * Note: if a table with composite keys is used, only the first five keys of the tuple are indexed
 */
contract KeysInTableHook is StoreHook {
  function handleSet(ResourceId tableId, bytes32[] memory keyTuple) internal {
    bytes32 keysHash = keccak256(abi.encode(keyTuple));

    // If the keyTuple has not yet been set in the table...
    if (!UsedKeysIndex.getHas(tableId, keysHash)) {
      uint40 length = uint40(KeysInTable.lengthKeyParts0(tableId));

      // Push the keyTuple to the list of keys in this table
      for (uint8 fieldIndex = 0; fieldIndex < keyTuple.length; fieldIndex++) {
        KeysInTableDynamicFieldIndex.pushKeyParts(fieldIndex, tableId, keyTuple[fieldIndex]);
      }

      // Update the index to avoid duplicating this keyTuple in the array
      UsedKeysIndex.set(tableId, keysHash, true, length);
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
    PackedCounter,
    bytes memory
  ) public override {
    handleSet(tableId, keyTuple);
  }

  function onBeforeDeleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout) public override {
    bytes32 keysHash = keccak256(abi.encode(keyTuple));
    (bool has, uint40 index) = UsedKeysIndex.get(tableId, keysHash);

    // If the keyTuple was part of the table...
    if (has) {
      // Delete the index as the keyTuple is not in the table anymore
      UsedKeysIndex.deleteRecord(tableId, keysHash);

      uint40 length = uint40(KeysInTable.lengthKeyParts0(tableId));

      if (length == 1) {
        // Delete the list of keys in this table
        KeysInTable.deleteRecord(tableId);
      } else {
        bytes32[] memory lastKeyTuple = new bytes32[](keyTuple.length);

        for (uint8 fieldIndex = 0; fieldIndex < keyTuple.length; fieldIndex++) {
          bytes32 lastKey = KeysInTableDynamicFieldIndex.getItemKeyParts(fieldIndex, tableId, length - 1);
          lastKeyTuple[fieldIndex] = lastKey;

          // Remove the keyTuple from the list of keys in this table
          KeysInTableDynamicFieldIndex.updateKeyParts(fieldIndex, tableId, index, lastKey);
          KeysInTableDynamicFieldIndex.popKeyParts(fieldIndex, tableId);
        }

        // Update the index of lastKeyTuple after swapping it with the deleted keyTuple
        bytes32 lastKeyHash = keccak256(abi.encode(lastKeyTuple));
        UsedKeysIndex.setIndex(tableId, lastKeyHash, index);
      }
    }
  }
}
