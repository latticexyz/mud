// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";

import { ResourceSelector } from "../../ResourceSelector.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithValue, KeysWithValueData } from "./tables/KeysWithValue.sol";
import { ArrayLib } from "../utils/ArrayLib.sol";
import { getTargetTableSelector } from "../utils/getTargetTableSelector.sol";

/**
 * This is a very naive and inefficient implementation for now.
 * We can optimize this by adding support for `setIndexOfField` in Store
 * (See https://github.com/latticexyz/mud/issues/444)
 *
 * Note: this module only supports up to 5 composite keys.
 */
contract KeysWithValueHook is IStoreHook {
  using ArrayLib for bytes32[];
  using ResourceSelector for bytes32;

  function _world() internal view returns (IBaseWorld) {
    return IBaseWorld(StoreSwitch.getStoreAddress());
  }

  function handleSet(bytes32 tableId, bytes32 valueHash, bytes32[] memory key) internal {
    if (key.length > 0) {
      KeysWithValue.pushKeys0(tableId, valueHash, key[0]);
      if (key.length > 1) {
        KeysWithValue.pushKeys1(tableId, valueHash, key[1]);
        if (key.length > 2) {
          KeysWithValue.pushKeys2(tableId, valueHash, key[2]);
          if (key.length > 3) {
            KeysWithValue.pushKeys3(tableId, valueHash, key[3]);
            if (key.length > 4) {
              KeysWithValue.pushKeys4(tableId, valueHash, key[4]);
            }
          }
        }
      }
    }
  }

  function onSetRecord(bytes32 sourceTableId, bytes32[] memory key, bytes memory data) public {
    bytes32 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);

    // Get the previous value
    bytes32 previousValue = keccak256(_world().getRecord(sourceTableId, key, valueSchema));

    // Remove the key from the list of keys with the previous value
    _removeKeyFromList(targetTableId, key, previousValue);

    // Push the key to the list of keys with the new value
    handleSet(targetTableId, keccak256(data), key);
  }

  function onBeforeSetField(
    bytes32 sourceTableId,
    bytes32[] memory key,
    uint8,
    bytes memory,
    Schema valueSchema
  ) public {
    // Remove the key from the list of keys with the previous value
    bytes32 previousValue = keccak256(_world().getRecord(sourceTableId, key, valueSchema));
    bytes32 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);
    _removeKeyFromList(targetTableId, key, previousValue);
  }

  function onAfterSetField(
    bytes32 sourceTableId,
    bytes32[] memory key,
    uint8,
    bytes memory,
    Schema valueSchema
  ) public {
    // Add the key to the list of keys with the new value
    bytes32 newValue = keccak256(_world().getRecord(sourceTableId, key, valueSchema));
    bytes32 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);
    handleSet(targetTableId, newValue, key);
  }

  function onDeleteRecord(bytes32 sourceTableId, bytes32[] memory key, Schema valueSchema) public {
    // Remove the key from the list of keys with the previous value
    bytes32 previousValue = keccak256(_world().getRecord(sourceTableId, key, valueSchema));
    bytes32 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);
    _removeKeyFromList(targetTableId, key, previousValue);
  }

  function _removeKeyFromList(bytes32 targetTableId, bytes32[] memory key, bytes32 valueHash) internal {
    // Get the keys with the previous value
    KeysWithValueData memory keysWithPreviousValue = KeysWithValue.get(targetTableId, valueHash);
    if (key.length > 0) {
      keysWithPreviousValue.keys0 = keysWithPreviousValue.keys0.filter(key[0]);
      if (key.length > 1) {
        keysWithPreviousValue.keys1 = keysWithPreviousValue.keys1.filter(key[1]);
        if (key.length > 2) {
          keysWithPreviousValue.keys2 = keysWithPreviousValue.keys2.filter(key[2]);
          if (key.length > 3) {
            keysWithPreviousValue.keys3 = keysWithPreviousValue.keys3.filter(key[3]);
            if (key.length > 4) {
              keysWithPreviousValue.keys4 = keysWithPreviousValue.keys4.filter(key[4]);
            }
          }
        }
      }
    }

    if (keysWithPreviousValue.keys0.length == 0) {
      // Delete the list of keys in this table
      KeysWithValue.deleteRecord(targetTableId, valueHash);
    } else {
      // Set the keys with the previous value
      KeysWithValue.set(targetTableId, valueHash, keysWithPreviousValue);
    }
  }
}
