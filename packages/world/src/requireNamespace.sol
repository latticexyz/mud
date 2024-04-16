// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId, WorldResourceIdInstance } from "./WorldResourceId.sol";
import { RESOURCE_NAMESPACE } from "./worldResourceTypes.sol";
import { IWorldErrors } from "./IWorldErrors.sol";

using WorldResourceIdInstance for ResourceId;

/**
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 */

/**
 * @notice Checks if a given `resourceId` is a namespace.
 * @dev Reverts with `IWorldErrors.World_InvalidResourceType` if the ID does not have the correct components.
 * @param resourceId The resource ID to check.
 */
function requireNamespace(ResourceId resourceId) pure {
  // Require the resourceId to have the namespace type and the root name
  // (the resource ID is identical to the resource ID of its namespace)
  if (ResourceId.unwrap(resourceId) != ResourceId.unwrap(resourceId.getNamespaceId())) {
    revert IWorldErrors.World_InvalidResourceType(RESOURCE_NAMESPACE, resourceId, resourceId.toString());
  }
}
