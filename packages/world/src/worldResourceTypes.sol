// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { RESOURCE_TABLE, RESOURCE_OFFCHAIN_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";

/**
 * @dev World Resource Types
 * @dev Constants related to World Resource Types and Masks.
 * @dev These constants are used to represent various resource types within the system.
 */

// Resource that identifies a namespace, a container belonging to a
// specific address (not necessarily the original deployer of the World).
// A namespace can includes tables and systems.
bytes2 constant RESOURCE_NAMESPACE = "ns";

// Resource that identifies a module, an on-chain script that
// can be executed on the World. Modules are used to install tables,
// systems, hooks, and new entry point to a World in order to extend
// its capabilities.
bytes2 constant RESOURCE_MODULE = "md";

// Resource that identifies a system, a contract used to manipulate
// the state.
bytes2 constant RESOURCE_SYSTEM = "sy";

// Masks used to filter or match a specific resource type
bytes32 constant MASK_RESOURCE_NAMESPACE = bytes32(RESOURCE_NAMESPACE);
bytes32 constant MASK_RESOURCE_MODULE = bytes32(RESOURCE_MODULE);
bytes32 constant MASK_RESOURCE_SYSTEM = bytes32(RESOURCE_SYSTEM);
