// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithValue } from "./tables/KeysWithValue.sol";
import { getTargetTableId } from "./getTargetTableId.sol";

/**
 * Get a list of keys with the given value.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getKeysWithValue(
  ResourceId tableId,
  bytes memory staticData,
  PackedCounter encodedLengths,
  bytes memory dynamicData
) view returns (bytes32[] memory keysWithValue) {
  // Get the corresponding reverse mapping table
  ResourceId keysWithValueTableId = getTargetTableId(MODULE_NAMESPACE, tableId);

  // Get the keys with the given value
  bytes memory value;
  if (dynamicData.length > 0) {
    value = abi.encodePacked(staticData, encodedLengths, dynamicData);
  } else {
    value = staticData;
  }
  keysWithValue = KeysWithValue.get(keysWithValueTableId, keccak256(value));
}

/**
 * Get a list of keys with the given value for the given store.
 */
function getKeysWithValue(
  IStore store,
  ResourceId tableId,
  bytes memory staticData,
  PackedCounter encodedLengths,
  bytes memory dynamicData
) view returns (bytes32[] memory keysWithValue) {
  // Get the corresponding reverse mapping table
  ResourceId keysWithValueTableId = getTargetTableId(MODULE_NAMESPACE, tableId);

  // Get the keys with the given value
  bytes memory value;
  if (dynamicData.length > 0) {
    value = abi.encodePacked(staticData, encodedLengths, dynamicData);
  } else {
    value = staticData;
  }
  keysWithValue = KeysWithValue.get(store, keysWithValueTableId, keccak256(value));
}
