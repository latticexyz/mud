// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { KeysInTable } from "./tables/KeysInTable.sol";

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

  Schema schema;
  // TODO: add getKeySchema to StoreSwitch?
  // Schema schema = IStore(this).getKeySchema(tableId);

  uint256 numFields = schema.numFields();
  uint256 length = KeysInTable.lengthKeys0(tableId);
  keyTuples = new bytes32[][](length);

  for (uint256 i; i < length; i++) {
    keyTuples[i] = new bytes32[](schema.numFields()); // the length of the key tuple depends on the schema

    if (numFields > 0) {
      keyTuples[i][0] = KeysInTable.getItemKeys0(tableId, i);
      if (numFields > 1) {
        keyTuples[i][1] = KeysInTable.getItemKeys1(tableId, i);
        if (numFields > 2) {
          keyTuples[i][2] = KeysInTable.getItemKeys2(tableId, i);
          if (numFields > 3) {
            keyTuples[i][3] = KeysInTable.getItemKeys3(tableId, i);
            if (numFields > 4) {
              keyTuples[i][4] = KeysInTable.getItemKeys4(tableId, i);
            }
          }
        }
      }
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
  uint256 length = KeysInTable.lengthKeys0(store, tableId);
  keyTuples = new bytes32[][](length);

  for (uint256 i; i < length; i++) {
    keyTuples[i] = new bytes32[](schema.numFields()); // the length of the key tuple depends on the schema

    if (numFields > 0) {
      keyTuples[i][0] = KeysInTable.getItemKeys0(store, tableId, i);
      if (numFields > 1) {
        keyTuples[i][1] = KeysInTable.getItemKeys1(store, tableId, i);
        if (numFields > 2) {
          keyTuples[i][2] = KeysInTable.getItemKeys2(store, tableId, i);
          if (numFields > 3) {
            keyTuples[i][3] = KeysInTable.getItemKeys3(store, tableId, i);
            if (numFields > 4) {
              keyTuples[i][4] = KeysInTable.getItemKeys4(store, tableId, i);
            }
          }
        }
      }
    }
  }
}
