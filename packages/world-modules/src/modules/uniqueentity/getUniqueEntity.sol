// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { UniqueEntitySystem } from "./UniqueEntitySystem.sol";

import { SystemSwitch } from "../../utils/SystemSwitch.sol";
import { SYSTEM_ID } from "./constants.sol";

/**
 * Increment and get an entity nonce.
 *
 * Note: this util can only be called within the context of a World (e.g. from a System or Module).
 * For usage outside of a World, use the overload that takes an explicit store argument.
 */
function getUniqueEntity() returns (bytes32 uniqueEntity) {
  return abi.decode(SystemSwitch.call(SYSTEM_ID, abi.encodeCall(UniqueEntitySystem.getUniqueEntity, ())), (bytes32));
}

/**
 * Increment and get an entity nonce.
 */
function getUniqueEntity(IBaseWorld world) returns (bytes32 uniqueEntity) {
  return abi.decode(world.call(SYSTEM_ID, abi.encodeCall(UniqueEntitySystem.getUniqueEntity, ())), (bytes32));
}
