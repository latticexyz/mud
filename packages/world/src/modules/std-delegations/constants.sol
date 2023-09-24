// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RESOURCE_SYSTEM } from "../../worldResourceTypes.sol";
import { ROOT_NAMESPACE } from "../../constants.sol";

bytes16 constant MODULE_NAME = bytes16("stddelegations.m");

// Callbound delegation
ResourceId constant CALLBOUND_DELEGATION = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("callbound")))
);

// Timebound delegation
ResourceId constant TIMEBOUND_DELEGATION = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_SYSTEM, ROOT_NAMESPACE, bytes16("timebound")))
);
