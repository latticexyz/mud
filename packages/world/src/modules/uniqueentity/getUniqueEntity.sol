// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";

import { UniqueEntity } from "./tables/UniqueEntity.sol";

/**
 * Increment and get an entity nonce.
 *
 * Note: this util can only be called within the context of a Store (e.g. from a System or Module).
 * For usage outside of a Store, use the overload that takes an explicit store argument.
 */
function getUniqueEntity() returns (uint256 uniqueEntity) {
  uniqueEntity = UniqueEntity.get() + 1;
  UniqueEntity.set(uniqueEntity);
}

/**
 * Increment and get an entity nonce.
 */
function getUniqueEntity(IStore store) returns (uint256 uniqueEntity) {
  uniqueEntity = UniqueEntity.get(store) + 1;
  UniqueEntity.set(store, uniqueEntity);
}
