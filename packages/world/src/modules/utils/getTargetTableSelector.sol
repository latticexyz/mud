// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { ResourceSelector } from "../../ResourceSelector.sol";

/**
 * Get a deterministic selector for the reverse mapping table for the given source table.
 * The selector is constructed as follows:
 *  - The first 8 bytes are the module namespace
 *  - The next 8 bytes are the first 8 bytes of the source table namespace
 *    -- This is to avoid collisions between tables with the same name in different namespaces
 *       (Note that collisions are still possible if the first 8 bytes of the namespace are the same, in which case installing the module fails)
 *  - The last 16 bytes are the source table name
 */
function getTargetTableSelector(bytes8 moduleNamespace, uint256 sourceTableId) pure returns (bytes32) {
  bytes16 tableName = ResourceSelector.getName(bytes32(sourceTableId));
  bytes8 sourceTableNamespace = bytes8(bytes32(sourceTableId));
  return bytes32(moduleNamespace) | (bytes32(sourceTableNamespace) >> 64) | (bytes32(tableName) >> 128);
}
