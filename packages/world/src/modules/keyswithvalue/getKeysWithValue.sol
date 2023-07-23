// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithValue } from "./tables/KeysWithValue.sol";
import { getTargetTableSelector } from "../utils/getTargetTableSelector.sol";

/**
 * Get a list of keys with the given value.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysWithValue(bytes32 tableId, bytes memory value) view returns (bytes32[][] memory keyTuples) {
  // Get the corresponding reverse mapping table
  bytes32 keysWithValueTableId = getTargetTableSelector(MODULE_NAMESPACE, tableId);
  bytes32 valueHash = keccak256(value);

  Schema schema = StoreSwitch.getKeySchema(tableId);
  uint256 numFields = schema.numFields();
  uint256 length = KeysWithValue.lengthKeys0(keysWithValueTableId, valueHash);
  keyTuples = new bytes32[][](length);

  for (uint256 i; i < length; i++) {
    keyTuples[i] = new bytes32[](numFields); // the length of the key tuple depends on the schema

    if (numFields > 0) {
      keyTuples[i][0] = KeysWithValue.getItemKeys0(keysWithValueTableId, valueHash, i);
      if (numFields > 1) {
        keyTuples[i][1] = KeysWithValue.getItemKeys1(keysWithValueTableId, valueHash, i);
        if (numFields > 2) {
          keyTuples[i][2] = KeysWithValue.getItemKeys2(keysWithValueTableId, valueHash, i);
          if (numFields > 3) {
            keyTuples[i][3] = KeysWithValue.getItemKeys3(keysWithValueTableId, valueHash, i);
            if (numFields > 4) {
              keyTuples[i][4] = KeysWithValue.getItemKeys4(keysWithValueTableId, valueHash, i);
            }
          }
        }
      }
    }
  }
}

/**
 * Get a list of keys with the given value for the given store.
 */
function getKeysWithValue(
  IStore store,
  bytes32 tableId,
  bytes memory value
) view returns (bytes32[][] memory keyTuples) {
  // Get the corresponding reverse mapping table
  bytes32 keysWithValueTableId = getTargetTableSelector(MODULE_NAMESPACE, tableId);
  bytes32 valueHash = keccak256(value);

  Schema schema = store.getKeySchema(tableId);
  uint256 numFields = schema.numFields();
  uint256 length = KeysWithValue.lengthKeys0(store, keysWithValueTableId, valueHash);
  keyTuples = new bytes32[][](length);

  for (uint256 i; i < length; i++) {
    keyTuples[i] = new bytes32[](numFields); // the length of the key tuple depends on the schema

    if (numFields > 0) {
      keyTuples[i][0] = KeysWithValue.getItemKeys0(store, keysWithValueTableId, valueHash, i);
      if (numFields > 1) {
        keyTuples[i][1] = KeysWithValue.getItemKeys1(store, keysWithValueTableId, valueHash, i);
        if (numFields > 2) {
          keyTuples[i][2] = KeysWithValue.getItemKeys2(store, keysWithValueTableId, valueHash, i);
          if (numFields > 3) {
            keyTuples[i][3] = KeysWithValue.getItemKeys3(store, keysWithValueTableId, valueHash, i);
            if (numFields > 4) {
              keyTuples[i][4] = KeysWithValue.getItemKeys4(store, keysWithValueTableId, valueHash, i);
            }
          }
        }
      }
    }
  }
}
