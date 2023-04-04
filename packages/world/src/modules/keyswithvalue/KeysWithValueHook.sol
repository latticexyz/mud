// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { IBaseWorld } from "@latticexyz/world/src/interfaces/IBaseWorld.sol";

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

  function onSetRecord(uint256 sourceTableId, bytes32[] memory key, bytes memory data) public {
    uint256 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId).toTableId();

    // Get the previous value
    bytes32 previousValue = keccak256(IBaseWorld(msg.sender).getRecord(sourceTableId, key));

    // Return if the value hasn't changed
    if (previousValue == keccak256(data)) return;

    // Remove the key from the list of keys with the previous value
    _removeKeyFromList(targetTableId, key[0], previousValue);

    // Push the key to the list of keys with the new value
    KeysWithValue.push(targetTableId, keccak256(data), key[0]);
  }

  function onBeforeSetField(uint256 sourceTableId, bytes32[] memory key, uint8, bytes memory) public {
    // Remove the key from the list of keys with the previous value
    bytes32 previousValue = keccak256(IBaseWorld(msg.sender).getRecord(sourceTableId, key));
    uint256 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId).toTableId();
    _removeKeyFromList(targetTableId, key[0], previousValue);
  }

  function onAfterSetField(uint256 sourceTableId, bytes32[] memory key, uint8, bytes memory) public {
    // Add the key to the list of keys with the new value
    bytes32 newValue = keccak256(IBaseWorld(msg.sender).getRecord(sourceTableId, key));
    uint256 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId).toTableId();
    KeysWithValue.push(targetTableId, newValue, key[0]);
  }

  function onDeleteRecord(uint256 sourceTableId, bytes32[] memory key) public {
    // Remove the key from the list of keys with the previous value
    bytes32 previousValue = keccak256(IBaseWorld(msg.sender).getRecord(sourceTableId, key));
    uint256 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId).toTableId();
    _removeKeyFromList(targetTableId, key[0], previousValue);
  }

  function _removeKeyFromList(uint256 targetTableId, bytes32 key, bytes32 valueHash) internal {
    // Get the keys with the previous value excluding the current key
    bytes32[] memory keysWithPreviousValue = KeysWithValue.get(targetTableId, valueHash).filter(key);

    // Set the keys with the previous value
    KeysWithValue.set(targetTableId, valueHash, keysWithPreviousValue);
  }
}
