// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { DelegationSystem } from "./DelegationSystem.sol";

function registerDelegationWithSignature(
  IBaseWorld world,
  address delegatee,
  ResourceId delegationControlId,
  bytes memory initCallData,
  address delegator,
  bytes memory signature
) {
  DelegationSystem(address(world)).registerDelegationWithSignature(
    delegatee,
    delegationControlId,
    initCallData,
    delegator,
    signature
  );
}
