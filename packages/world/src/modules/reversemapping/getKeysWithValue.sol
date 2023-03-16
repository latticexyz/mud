// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { ResourceSelector } from "../../ResourceSelector.sol";
import { MODULE_NAMESPACE } from "./constants.sol";
import { getTargetTableSelector } from "./getTargetTableSelector.sol";

import { ReverseMapping } from "./tables/ReverseMapping.sol";

/**
 * Get a list of keys with the given value.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysWithValue(uint256 tableId, bytes memory value) view returns (bytes32[] memory keysWithValue) {
  // Get the corresponding reverse mapping table
  uint256 reverseMappingTableId = uint256(getTargetTableSelector(tableId));

  // Get the keys with the given value
  keysWithValue = ReverseMapping.get(reverseMappingTableId, keccak256(value));
}

/**
 * Get a list of keys with the given value for the given store.
 */
function getKeysWithValue(
  IStore store,
  uint256 tableId,
  bytes memory value
) view returns (bytes32[] memory keysWithValue) {
  console.log("getKeysWithValue");
  console.logBytes(value);
  console.logBytes32(keccak256(value));
  // Get the corresponding reverse mapping table
  uint256 reverseMappingTableId = uint256(getTargetTableSelector(tableId));

  // Get the keys with the given value
  keysWithValue = ReverseMapping.get(reverseMappingTableId, store, keccak256(value));
}
