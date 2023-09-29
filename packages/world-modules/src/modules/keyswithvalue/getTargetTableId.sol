// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { TYPE_BITS } from "@latticexyz/store/src/ResourceId.sol";
import { ResourceId, WorldResourceIdInstance, NAME_BITS } from "@latticexyz/world/src/WorldResourceId.sol";
import { RESOURCE_TABLE } from "@latticexyz/world/src/worldResourceTypes.sol";

uint256 constant MODULE_NAMESPACE_BITS = 7 * 8;
uint256 constant TABLE_NAMESPACE_BITS = 7 * 8;
uint256 constant TABLE_NAME_BITS = 16 * 8;

/**
 * Get a deterministic selector for the reverse mapping table for the given source table.
 * The selector is constructed as follows:
 *  - The first 2 bytes are the resource type
 *  - The next 7 bytes are the module namespace
 *  - The next 7 bytes are the first 7 bytes of the source table namespace
 *    -- This is to avoid collisions between tables with the same name in different namespaces
 *       (Note that collisions are still possible if the first 7 bytes of the namespace are the same, in which case installing the module fails)
 *  - The last 16 bytes are the source table name
 */
function getTargetTableId(bytes7 moduleNamespace, ResourceId sourceTableId) pure returns (ResourceId) {
  bytes16 tableName = WorldResourceIdInstance.getName(sourceTableId);
  bytes7 sourceTableNamespace = bytes7(WorldResourceIdInstance.getNamespace(sourceTableId));
  return
    ResourceId.wrap(
      bytes32(RESOURCE_TABLE) |
        (bytes32(moduleNamespace) >> TYPE_BITS) |
        (bytes32(sourceTableNamespace) >> (TYPE_BITS + MODULE_NAMESPACE_BITS)) |
        (bytes32(tableName) >> (TYPE_BITS + MODULE_NAMESPACE_BITS + TABLE_NAMESPACE_BITS))
    );
}
