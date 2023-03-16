// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { console } from "forge-std/console.sol";

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { IWorld } from "@latticexyz/world/src/interfaces/IWorld.sol";

import { ResourceSelector } from "../../ResourceSelector.sol";

import { ReverseMapping } from "./tables/ReverseMapping.sol";
import { ArrayLib } from "./ArrayLib.sol";
import { getTargetTableSelector } from "./getTargetTableSelector.sol";

/**
 * This is a very naive and inefficient implementation for now.
 * We can optimize this by adding support for `setIndexOfField` in Store
 * and then replicate logic from solecs's Set.sol.
 * (See https://github.com/latticexyz/mud/issues/444)
 */
contract ReverseMappingHook is IStoreHook {
  using ArrayLib for bytes32[];
  using ResourceSelector for bytes32;

  error MultipleKeysNotSupported();

  function onSetRecord(uint256 sourceTableId, bytes32[] memory key, bytes memory data) public {
    console.log("on set rec");
    _requireSingleKey(key);
    uint256 targetTableId = getTargetTableSelector(sourceTableId).toTableId();

    // Get the previous value
    bytes32 previousValue = keccak256(IWorld(msg.sender).getRecord(sourceTableId, key));

    // Return if the value hasn't changed
    if (previousValue == keccak256(data)) return;

    // Remove the key from the list of keys with the previous value
    _removeKeyFromList(targetTableId, key[0], previousValue);

    // Push the key to the list of keys with the new value
    ReverseMapping.push(targetTableId, keccak256(data), key[0]);
  }

  function onBeforeSetField(uint256 sourceTableId, bytes32[] memory key, uint8, bytes memory) public {
    console.log("on before");
    _requireSingleKey(key);

    // Remove the key from the list of keys with the previous value
    bytes32 previousValue = keccak256(IWorld(msg.sender).getRecord(sourceTableId, key));
    uint256 targetTableId = getTargetTableSelector(sourceTableId).toTableId();
    _removeKeyFromList(targetTableId, key[0], previousValue);
  }

  function onAfterSetField(uint256 sourceTableId, bytes32[] memory key, uint8, bytes memory) public {
    console.log("on after");
    _requireSingleKey(key);

    // Add the key to the list of keys with the new value
    bytes32 newValue = keccak256(IWorld(msg.sender).getRecord(sourceTableId, key));
    uint256 targetTableId = getTargetTableSelector(sourceTableId).toTableId();
    ReverseMapping.push(targetTableId, newValue, key[0]);
  }

  function onDeleteRecord(uint256 sourceTableId, bytes32[] memory key) public {
    _requireSingleKey(key);

    // Remove the key from the list of keys with the previous value
    bytes32 previousValue = keccak256(IWorld(msg.sender).getRecord(sourceTableId, key));
    uint256 targetTableId = getTargetTableSelector(sourceTableId).toTableId();
    _removeKeyFromList(targetTableId, key[0], previousValue);
  }

  function _requireSingleKey(bytes32[] memory key) internal pure {
    if (key.length > 1) revert MultipleKeysNotSupported();
  }

  function _removeKeyFromList(uint256 targetTableId, bytes32 key, bytes32 valueHash) internal {
    console.log("on after");
    // Get the keys with the previous value excluding the current key
    bytes32[] memory keysWithPreviousValue = ReverseMapping.get(targetTableId, valueHash).filter(key);

    // Set the keys with the previous value
    ReverseMapping.set(targetTableId, valueHash, keysWithPreviousValue);
  }
}
