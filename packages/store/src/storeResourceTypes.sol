// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title Resource Identifiers
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice Constants representing unique identifiers for different resource types.
 * @dev These identifiers can be used to distinguish between various resource types.
 */

/// @dev Identifier for a resource table.
bytes2 constant RESOURCE_TABLE = "tb";

/// @dev Identifier for an offchain resource table.
bytes2 constant RESOURCE_OFFCHAIN_TABLE = "ot";
