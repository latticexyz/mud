// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { UsedKeysIndex } from "./tables/UsedKeysIndex.sol";

/**
 * Get whether the keyTuple is in the given table.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function hasKey(ResourceId tableId, bytes32[] memory keyTuple) view returns (bool) {
  bytes32 keysHash = keccak256(abi.encode(keyTuple));

  return UsedKeysIndex.getHas(tableId, keysHash);
}

/**
 * Get whether the keyTuple is in the given table for the given store.
 */
function hasKey(IStore store, ResourceId tableId, bytes32[] memory keyTuple) view returns (bool) {
  bytes32 keysHash = keccak256(abi.encode(keyTuple));

  return UsedKeysIndex.getHas(store, tableId, keysHash);
}
