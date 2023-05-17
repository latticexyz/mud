// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { WithValueIndex } from "./tables/WithValueIndex.sol";

/**
 * Get whether the key has the given value in the given table.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function hasKey(bytes32 tableId, bytes32[] memory key, bytes memory value) view returns (bool) {
  bytes32 keysHash = keccak256(abi.encode(key));
  bytes32 valueHash = keccak256(abi.encode(value));

  return WithValueIndex.getHas(tableId, valueHash, keysHash);
}

/**
 * Get whether the key has the given value in the given table for the given store.
 */
function hasKey(IStore store, bytes32 tableId, bytes32[] memory key, bytes memory value) view returns (bool) {
  bytes32 keysHash = keccak256(abi.encode(key));
  bytes32 valueHash = keccak256(abi.encode(value));

  return WithValueIndex.getHas(store, tableId, valueHash, keysHash);
}
