// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";

import { ResourceSelector } from "../../ResourceSelector.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithTable } from "./tables/KeysWithTable.sol";
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
contract KeysWithTableHook is IStoreHook {
  using ArrayLib for bytes32[];
  using ResourceSelector for bytes32;

  function onSetRecord(uint256 sourceTableId, bytes32[] memory key, bytes memory) public {
    uint256 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId).toTableId();

    // Remove the key from the list of keys in this table
    _removeKeyFromList(targetTableId, key[0]);

    // Push the key to the list of keys in this table
    KeysWithTable.push(targetTableId, key[0]);
  }

  function onBeforeSetField(uint256 sourceTableId, bytes32[] memory key, uint8, bytes memory) public {
    // Remove the key from the list of keys in this table
    uint256 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId).toTableId();
    _removeKeyFromList(targetTableId, key[0]);
  }

  function onAfterSetField(uint256 sourceTableId, bytes32[] memory key, uint8, bytes memory) public {
    // Add the key to the list of keys in this table
    uint256 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId).toTableId();
    KeysWithTable.push(targetTableId, key[0]);
  }

  function onDeleteRecord(uint256 sourceTableId, bytes32[] memory key) public {
    // Remove the key from the list of keys in this table
    uint256 targetTableId = getTargetTableSelector(MODULE_NAMESPACE, sourceTableId).toTableId();
    _removeKeyFromList(targetTableId, key[0]);
  }

  function _removeKeyFromList(uint256 targetTableId, bytes32 key) internal {
    // Get the keys in this table excluding the current key
    bytes32[] memory keysWithTable = KeysWithTable.get(targetTableId).filter(key);

    // Set the keys in this table
    KeysWithTable.set(targetTableId, keysWithTable);
  }
}
