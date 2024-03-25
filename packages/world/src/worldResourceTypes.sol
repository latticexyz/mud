// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { RESOURCE_TABLE, RESOURCE_OFFCHAIN_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";

/**
 * @dev Constants used to work with world resource types.
 */

// Resource that identifies a namespace, a container belonging to a
// specific address (not necessarily the original deployer of the World).
// A namespace can include tables and systems.
bytes2 constant RESOURCE_NAMESPACE = "ns";

// Resource that identifies a system, a contract used to manipulate
// the state.
bytes2 constant RESOURCE_SYSTEM = "sy";

// Masks used to filter or match a specific resource type
bytes32 constant MASK_RESOURCE_NAMESPACE = bytes32(RESOURCE_NAMESPACE);
