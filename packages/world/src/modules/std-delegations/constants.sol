// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { ResourceId } from "../../WorldResourceId.sol";
import { RESOURCE_SYSTEM } from "../../worldResourceTypes.sol";
import { ROOT_NAMESPACE } from "../../constants.sol";

bytes16 constant MODULE_NAME = bytes16("stddelegations.m");

// Callbound delegation
ResourceId constant CALLBOUND_DELEGATION = ResourceId.wrap(
  bytes32(abi.encodePacked(ROOT_NAMESPACE, bytes16("callbound"), RESOURCE_SYSTEM))
);

// Timebound delegation
ResourceId constant TIMEBOUND_DELEGATION = ResourceId.wrap(
  bytes32(abi.encodePacked(ROOT_NAMESPACE, bytes16("timebound"), RESOURCE_SYSTEM))
);
