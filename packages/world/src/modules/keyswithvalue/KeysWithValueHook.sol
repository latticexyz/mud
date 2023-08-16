// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";

import { ResourceSelector } from "../../ResourceSelector.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithValue } from "./tables/KeysWithValue.sol";
import { ArrayLib } from "../utils/ArrayLib.sol";
import { getTargetTableSelector } from "../utils/getTargetTableSelector.sol";

/**
 * This is a very naive and inefficient implementation for now.
 * We can optimize this by adding support for `setIndexOfField` in Store
 * and then replicate logic from solecs's Set.sol.
 * (See https://github.com/latticexyz/mud/issues/444)
 *
 * Note: if a table with composite keys is used, only the first key is indexed
 */
contract KeysWithValueHook is IStoreHook {
  using ArrayLib for bytes32[];
  using ResourceSelector for bytes32;

  function _world() internal view returns (IBaseWorld) {
    return IBaseWorld(StoreSwitch.getStoreAddress());
  }

  function onSetRecord(bytes32 sourceTableId, bytes32[] memory key, bytes memory data, Schema valueSchema) public {
    bytes32 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);

    // Get the previous value
    bytes32 previousValue = keccak256(_world().getRecord(sourceTableId, key, valueSchema));

    // Remove the key from the list of keys with the previous value
    _removeKeyFromList(targetTableId, key[0], previousValue);

    // Push the key to the list of keys with the new value
    KeysWithValue.push(targetTableId, keccak256(data), key[0]);
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
    _removeKeyFromList(targetTableId, key[0], previousValue);
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
    KeysWithValue.push(targetTableId, newValue, key[0]);
  }

  function onDeleteRecord(bytes32 sourceTableId, bytes32[] memory key, Schema valueSchema) public {
    // Remove the key from the list of keys with the previous value
    bytes32 previousValue = keccak256(_world().getRecord(sourceTableId, key, valueSchema));
    bytes32 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId);
    _removeKeyFromList(targetTableId, key[0], previousValue);
  }

  function _removeKeyFromList(bytes32 targetTableId, bytes32 key, bytes32 valueHash) internal {
    // Get the keys with the previous value excluding the current key
    bytes32[] memory keysWithPreviousValue = KeysWithValue.get(targetTableId, valueHash).filter(key);

    if (keysWithPreviousValue.length == 0) {
      // Delete the list of keys in this table
      KeysWithValue.deleteRecord(targetTableId, valueHash);
    } else {
      // Set the keys with the previous value
      KeysWithValue.set(targetTableId, valueHash, keysWithPreviousValue);
    }
  }
}
