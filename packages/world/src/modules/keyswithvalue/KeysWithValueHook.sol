// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";

import { KeysWithValue } from "./tables/KeysWithValue.sol";
import { WithValueIndex } from "./tables/WithValueIndex.sol";

/**
 * Note: if a table with composite keys is used, only the first key is indexed
 */
contract KeysWithValueHook is IStoreHook {
  function handleDelete(bytes32 tableId, bytes32[] memory key, bytes memory value) internal {
    bytes32 keyHash = keccak256(abi.encode(key));
    bytes32 valueHash = keccak256(value);

    (bool has, uint256 index) = WithValueIndex.get(tableId, valueHash, keyHash);

    // If the key/value pair was in the table...
    if (has) {
      // Delete the index
      WithValueIndex.deleteRecord(tableId, valueHash, keyHash);

      uint256 length = KeysWithValue.length(tableId, valueHash);

      if (length == 1) {
        // Fully delete the list for this value
        KeysWithValue.deleteRecord(tableId, valueHash);
      } else {
        bytes32 lastKey = KeysWithValue.getItem(tableId, valueHash, length - 1);

        // Remove this key/value pair from the list
        KeysWithValue.update(tableId, valueHash, index, lastKey);
        KeysWithValue.pop(tableId, valueHash);
      }
    }
  }

  function handleSet(bytes32 tableId, bytes32[] memory key, bytes memory value) internal {
    bytes32 keyHash = keccak256(abi.encode(key));
    bytes32 valueHash = keccak256(value);

    // If the key/value pair is not in the table...
    if (!WithValueIndex.getHas(tableId, valueHash, keyHash)) {
      uint256 length = KeysWithValue.length(tableId, valueHash);

      // Push the key/value pair to the list
      KeysWithValue.push(tableId, valueHash, key[0]);

      // Update the index to avoid duplicating keys
      WithValueIndex.set(tableId, valueHash, keyHash, true, uint32(length));
    }
  }

  function onSetRecord(bytes32 tableId, bytes32[] memory key, bytes memory data) public {
    bytes memory previousValue = IBaseWorld(msg.sender).getRecord(tableId, key);

    handleDelete(tableId, key, previousValue);
    handleSet(tableId, key, data);
  }

  function onBeforeSetField(bytes32 tableId, bytes32[] memory key, uint8, bytes memory) public {
    bytes memory previousValue = IBaseWorld(msg.sender).getRecord(tableId, key);

    handleDelete(tableId, key, previousValue);
  }

  function onAfterSetField(bytes32 tableId, bytes32[] memory key, uint8, bytes memory) public {
    bytes memory newValue = IBaseWorld(msg.sender).getRecord(tableId, key);

    handleSet(tableId, key, newValue);
  }

  function onDeleteRecord(bytes32 tableId, bytes32[] memory key) public {
    bytes memory previousValue = IBaseWorld(msg.sender).getRecord(tableId, key);

    handleDelete(tableId, key, previousValue);
  }
}
