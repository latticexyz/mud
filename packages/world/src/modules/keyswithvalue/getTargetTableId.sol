// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { ResourceId } from "../../ResourceId.sol";
import { RESOURCE_TABLE } from "../../worldResourceTypes.sol";

/**
 * Get a deterministic selector for the reverse mapping table for the given source table.
 * The selector is constructed as follows:
 *  - The first 7 bytes are the module namespace
 *  - The next 7 bytes are the first 8 bytes of the source table namespace
 *    -- This is to avoid collisions between tables with the same name in different namespaces
 *       (Note that collisions are still possible if the first 8 bytes of the namespace are the same, in which case installing the module fails)
 *  - The last 16 bytes are the source table name
 */
function getTargetTableId(bytes7 moduleNamespace, bytes32 sourceTableId) pure returns (bytes32) {
  bytes16 tableName = ResourceId.getName(sourceTableId);
  bytes7 sourceTableNamespace = bytes7(bytes32(sourceTableId));
  return
    bytes32(moduleNamespace) |
    (bytes32(sourceTableNamespace) >> (7 * 8)) |
    (bytes32(tableName) >> (14 * 8)) |
    (bytes32(RESOURCE_TABLE) >> (30 * 8));
}
