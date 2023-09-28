// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/**
 * @title Store Versioning
 * @notice Contains a constant representing the version of the store.
 * @dev It is crucial to ensure you're interacting with the expected version, especially if audited.
 */

/// @dev Identifier for the current store version.
bytes32 constant STORE_VERSION = "1.0.0-unaudited";
