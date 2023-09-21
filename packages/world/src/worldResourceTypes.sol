// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { RESOURCE_TABLE, RESOURCE_OFFCHAIN_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";

bytes2 constant RESOURCE_NAMESPACE = "ns";
bytes2 constant RESOURCE_MODULE = "md";
bytes2 constant RESOURCE_SYSTEM = "sy";

bytes32 constant MASK_RESOURCE_NAMESPACE = bytes32(RESOURCE_NAMESPACE);
bytes32 constant MASK_RESOURCE_MODULE = bytes32(RESOURCE_MODULE);
bytes32 constant MASK_RESOURCE_SYSTEM = bytes32(RESOURCE_SYSTEM);
