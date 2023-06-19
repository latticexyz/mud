// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { KeysInTable } from "./tables/KeysInTable.sol";
import { KeysInTableDynamicFieldIndex } from "./KeysInTableDynamicFieldIndex.sol";

/**
 * Get a list of keys in the given table.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysInTable(bytes32 tableId) view returns (bytes32[][] memory keyTuples) {
  /**
   * Note: this module only supports up to 5 composite keys.
   */

  Schema schema = StoreSwitch.getKeySchema(tableId);

  uint256 numFields = schema.numFields();
  uint256 length = KeysInTable.lengthKeyParts0(tableId);
  keyTuples = new bytes32[][](length);

  for (uint256 i; i < length; i++) {
    // the length of the key tuple depends on the schema
    keyTuples[i] = new bytes32[](numFields);
    for (uint8 fieldIndex = 0; fieldIndex < numFields; fieldIndex++) {
      keyTuples[i][fieldIndex] = KeysInTableDynamicFieldIndex.getItemKeyParts(fieldIndex, tableId, i);
    }
  }
}

/**
 * Get a list of keys in the given table for the given store.
 */
function getKeysInTable(IStore store, bytes32 tableId) view returns (bytes32[][] memory keyTuples) {
  /**
   * Note: this module only supports up to 5 composite keys.
   */

  Schema schema = store.getKeySchema(tableId);

  uint256 numFields = schema.numFields();
  uint256 length = KeysInTable.lengthKeyParts0(store, tableId);
  keyTuples = new bytes32[][](length);

  for (uint256 i; i < length; i++) {
    // the length of the key tuple depends on the schema
    keyTuples[i] = new bytes32[](numFields);
    for (uint8 fieldIndex = 0; fieldIndex < numFields; fieldIndex++) {
      keyTuples[i][fieldIndex] = KeysInTableDynamicFieldIndex.getItemKeyParts(fieldIndex, store, tableId, i);
    }
  }
}
