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
  function handleDelete(bytes32 tableId, bytes32[] memory key, bytes32 valueHash) internal {
    bytes32 keysHash = keccak256(abi.encode(key));

    (bool has, uint32 index) = WithValueIndex.get(tableId, valueHash, keysHash);

    // If the key was part of the table...
    if (has) {
      // Delete the index as the key is not in the table
      WithValueIndex.deleteRecord(tableId, valueHash, keysHash);

      uint32 length = KeysWithValue.getLength(tableId, valueHash);

      if (length == 1) {
        // Delete the list of keys in this table
        KeysWithValue.deleteRecord(tableId, valueHash);
      } else {
        bytes32 lastKey = KeysWithValue.getKeys(tableId, valueHash)[length - 1];

        // Remove the key from the list of keys in this table
        KeysWithValue.updateKeys(tableId, valueHash, index, lastKey);
        KeysWithValue.popKeys(tableId, valueHash);

        KeysWithValue.setLength(tableId, valueHash, length - 1);
      }
    }
  }

  function handleSet(bytes32 tableId, bytes32[] memory key, bytes32 valueHash) internal {
    bytes32 keysHash = keccak256(abi.encode(key));

    // If the key has not yet been set in the table...
    if (!WithValueIndex.getHas(tableId, valueHash, keysHash)) {
      uint32 length = KeysWithValue.getLength(tableId, valueHash);

      // Push the key to the list of keys in this table
      KeysWithValue.pushKeys(tableId, valueHash, key[0]);
      KeysWithValue.setLength(tableId, valueHash, length + 1);

      // Update the index to avoid duplicating this key in the array
      WithValueIndex.set(tableId, valueHash, keysHash, true, length);
    }
  }

  function onSetRecord(bytes32 tableId, bytes32[] memory key, bytes memory data) public {
    bytes32 previousValue = keccak256(IBaseWorld(msg.sender).getRecord(tableId, key));
    bytes32 newValue = keccak256(data);

    handleDelete(tableId, key, previousValue);
    handleSet(tableId, key, newValue);
  }

  function onBeforeSetField(bytes32 tableId, bytes32[] memory key, uint8, bytes memory) public {
    bytes32 previousValue = keccak256(IBaseWorld(msg.sender).getRecord(tableId, key));

    handleDelete(tableId, key, previousValue);
  }

  function onAfterSetField(bytes32 tableId, bytes32[] memory key, uint8, bytes memory) public {
    bytes32 newValue = keccak256(IBaseWorld(msg.sender).getRecord(tableId, key));

    handleSet(tableId, key, newValue);
  }

  function onDeleteRecord(bytes32 tableId, bytes32[] memory key) public {
    bytes32 previousValue = keccak256(IBaseWorld(msg.sender).getRecord(tableId, key));

    handleDelete(tableId, key, previousValue);
  }
}
