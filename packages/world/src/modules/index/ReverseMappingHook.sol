// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { console } from "forge-std/console.sol";

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { IWorld } from "@latticexyz/world/src/interfaces/IWorld.sol";

import { ReverseMapping } from "./tables/ReverseMapping.sol";

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
    if (key.length > 1) revert MultipleKeysNotSupported();
    if (table != sourceTableId) revert InvalidTable(table, sourceTableId);

    // Get the previous value
    bytes32 previousValue = keccak256(IWorld(msg.sender).getRecord(sourceTableId, key));

    // Return if the value hasn't changed
    if (previousValue == keccak256(data)) return;

    // Get the keys with the previous value excluding the current key
    bytes32[] memory keysWithPreviousValue = ReverseMapping.get(targetTableId, previousValue).filter(key[0]);

    // Set the keys with the previous value
    ReverseMapping.set(targetTableId, previousValue, keysWithPreviousValue);

    // Push the current key to the list of keys with the new value
    ReverseMapping.push(targetTableId, keccak256(data), key[0]);
  }

  function onSetField(uint256 table, bytes32[] memory key, uint8 schemaIndex, bytes memory data) public view {
    console.log("set field");
  }

  function onDeleteRecord(uint256 table, bytes32[] memory key) public view {
    console.log("delete record");
  }
}

library ArrayLib {
  function includes(bytes32[] memory arr, bytes32 element) internal pure returns (bool) {
    for (uint256 i; i < arr.length; i++) {
      if (arr[i] == element) {
        return true;
      }
    }
    return false;
  }

  function filter(bytes32[] memory arr, bytes32 element) internal pure returns (bytes32[] memory) {
    bytes32[] memory filtered = new bytes32[](arr.length);
    uint256 filteredIndex = 0;
    for (uint256 i; i < arr.length; i++) {
      if (arr[i] != element) {
        filtered[filteredIndex] = arr[i];
        filteredIndex++;
      }
    }

    // In-place update the length of the array
    // (Note: this does not update the free memory pointer)
    assembly {
      mstore(filtered, filteredIndex)
    }

    return filtered;
  }
}
