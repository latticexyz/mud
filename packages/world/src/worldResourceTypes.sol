// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { RESOURCE_TABLE, RESOURCE_OFFCHAIN_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";

bytes2 constant RESOURCE_NAMESPACE = "ns";
bytes2 constant RESOURCE_MODULE = "md";
bytes2 constant RESOURCE_SYSTEM = "sy";

// First 30 bytes are zero, last 2 bytes are the resource type
bytes32 constant MASK_RESOURCE_NAMESPACE = bytes32(RESOURCE_NAMESPACE) >> (30 * 8);
bytes32 constant MASK_RESOURCE_MODULE = bytes32(RESOURCE_MODULE) >> (30 * 8);
bytes32 constant MASK_RESOURCE_SYSTEM = bytes32(RESOURCE_SYSTEM) >> (30 * 8);
