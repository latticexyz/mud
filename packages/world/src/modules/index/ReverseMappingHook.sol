// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { console } from "forge-std/console.sol";

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { IWorld } from "@latticexyz/world/src/interfaces/IWorld.sol";

import { ReverseMapping } from "./tables/ReverseMapping.sol";
import { ArrayLib } from "./ArrayLib.sol";

/**
 * This is an extremely naive and inefficient implementation for now.
 * We need support for `setFieldIndex` to make it more efficient (like the previous Set.sol)
 */
contract ReverseMappingHook is IStoreHook {
  using ArrayLib for bytes32[];

  error MultipleKeysNotSupported();
  error InvalidTable(uint256 received, uint256 expected);

  uint256 public immutable sourceTableId;
  uint256 public immutable targetTableId;

  constructor(uint256 _sourceTableId, uint256 _targetTableId) {
    sourceTableId = _sourceTableId;
    targetTableId = _targetTableId;
  }

  function onSetRecord(uint256 table, bytes32[] memory key, bytes memory data) public {
    _sanityChecks(table, key);

    // Get the previous value
    bytes32 previousValue = keccak256(IWorld(msg.sender).getRecord(sourceTableId, key));

    // Return if the value hasn't changed
    if (previousValue == keccak256(data)) return;

    // Remove the current key from the list of keys with the previous value
    _removeKeyFromList(key[0], previousValue);

    // Push the current key to the list of keys with the new value
    ReverseMapping.push(targetTableId, keccak256(data), key[0]);
  }

  function preSetField(uint256 table, bytes32[] memory key, uint8, bytes memory) public {
    _sanityChecks(table, key);

    // Remove the key from the list of keys with the previous value
    bytes32 previousValue = keccak256(IWorld(msg.sender).getRecord(sourceTableId, key));
    _removeKeyFromList(key[0], previousValue);
  }

  function postSetField(uint256 table, bytes32[] memory key, uint8, bytes memory) public {
    _sanityChecks(table, key);

    // Add the key to the list of keys with the new value
    bytes32 newValue = keccak256(IWorld(msg.sender).getRecord(sourceTableId, key));
    ReverseMapping.push(targetTableId, newValue, key[0]);
  }

  function onDeleteRecord(uint256 table, bytes32[] memory key) public {
    _sanityChecks(table, key);

    // Get the previous value
    bytes32 previousValue = keccak256(IWorld(msg.sender).getRecord(sourceTableId, key));
    _removeKeyFromList(key[0], previousValue);
  }

  function _sanityChecks(uint256 table, bytes32[] memory key) internal view {
    if (key.length > 1) revert MultipleKeysNotSupported();
    if (table != sourceTableId) revert InvalidTable(table, sourceTableId);
  }

  function _removeKeyFromList(bytes32 key, bytes32 valueHash) internal {
    // Get the keys with the previous value excluding the current key
    bytes32[] memory keysWithPreviousValue = ReverseMapping.get(targetTableId, valueHash).filter(key);

    // Set the keys with the previous value
    ReverseMapping.set(targetTableId, valueHash, keysWithPreviousValue);
  }
}
