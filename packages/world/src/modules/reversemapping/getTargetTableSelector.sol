// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { ResourceSelector } from "../../ResourceSelector.sol";
import { MODULE_NAMESPACE } from "./constants.sol";

/**
 * Get a deterministic selector for the reverse mapping table for the given source table.
 * The selector is constructed as follows:
 *  - The first 12 bytes are the module namespace
 *  - The next 4 bytes are the first 4 bytes of the source table namespace
 *    -- This is to avoid collisions between tables with the same name in different namespaces
 *       (Note that collisions are still possible if the first 4 bytes of the namespace are the same, in which case installing the module fails)
 *  - The last 16 bytes are the source table name
 */
function getTargetTableSelector(uint256 sourceTableId) pure returns (bytes32) {
  bytes16 tableName = ResourceSelector.getFile(bytes32(sourceTableId));
  bytes4 sourceTableNamespace = bytes4(bytes32(sourceTableId));
  return bytes32(MODULE_NAMESPACE) | (bytes32(sourceTableNamespace) >> 96) | (bytes32(tableName) >> 128);
}
