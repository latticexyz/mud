// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithValue } from "./tables/KeysWithValue.sol";
import { getTargetTableSelector } from "../utils/getTargetTableSelector.sol";

/**
 * Get a list of keys with the given value.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysWithValue(
  bytes32 tableId,
  bytes memory staticData,
  PackedCounter encodedLengths,
  bytes memory dynamicData
) view returns (bytes32[] memory keysWithValue) {
  // Get the corresponding reverse mapping table
  bytes32 keysWithValueTableId = getTargetTableSelector(MODULE_NAMESPACE, tableId);

  // Get the keys with the given value
  bytes memory value = abi.encodePacked(staticData, encodedLengths, dynamicData);
  keysWithValue = KeysWithValue.get(keysWithValueTableId, keccak256(value));
}

/**
 * Get a list of keys with the given value for the given store.
 */
function getKeysWithValue(
  IStore store,
  bytes32 tableId,
  bytes memory staticData,
  PackedCounter encodedLengths,
  bytes memory dynamicData
) view returns (bytes32[] memory keysWithValue) {
  // Get the corresponding reverse mapping table
  bytes32 keysWithValueTableId = getTargetTableSelector(MODULE_NAMESPACE, tableId);

  // Get the keys with the given value
  bytes memory value = abi.encodePacked(staticData, encodedLengths, dynamicData);
  keysWithValue = KeysWithValue.get(store, keysWithValueTableId, keccak256(value));
}
