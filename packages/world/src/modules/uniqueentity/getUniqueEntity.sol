// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";

import { IBaseWorld } from "../../interfaces/IBaseWorld.sol";
import { IUniqueEntitySystem } from "../../interfaces/IUniqueEntitySystem.sol";

/**
 * Increment and get an entity nonce.
 *
 * Note: this util can only be called within the context of a World (e.g. from a System or Module).
 * For usage outside of a World, use the overload that takes an explicit store argument.
 */
function getUniqueEntity() returns (bytes32 uniqueEntity) {
  address world = StoreSwitch.inferStoreAddress();
  return IUniqueEntitySystem(world).uniqueEntity_system_getUniqueEntity();
}

/**
 * Increment and get an entity nonce.
 */
function getUniqueEntity(IBaseWorld world) returns (bytes32 uniqueEntity) {
  return IUniqueEntitySystem(address(world)).uniqueEntity_system_getUniqueEntity();
}
