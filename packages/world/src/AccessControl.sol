// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId, WorldResourceIdInstance } from "./WorldResourceId.sol";
import { IWorldErrors } from "./IWorldErrors.sol";

import { ResourceAccess } from "./codegen/tables/ResourceAccess.sol";
import { NamespaceOwner } from "./codegen/tables/NamespaceOwner.sol";

/**
 * @title AccessControl
 * @dev Provides access control functions for checking permissions and ownership within a namespace.
 */
library AccessControl {
  using WorldResourceIdInstance for ResourceId;

  /**
   * @notice Checks if the caller has access to the given resource ID or its namespace.
   * @param resourceId The resource ID to check access for.
   * @param caller The address of the caller.
   * @return true if the caller has access, false otherwise.
   */
  function hasAccess(ResourceId resourceId, address caller) internal view returns (bool) {
    return
      // First check access based on the namespace. If caller has no namespace access, check access on the resource.
      ResourceAccess._get(resourceId.getNamespaceId(), caller) || ResourceAccess._get(resourceId, caller);
  }

  /**
   * @notice Check for access at the given namespace or resource.
   * @param resourceId The resource ID to check access for.
   * @param caller The address of the caller.
   * @dev Reverts with IWorldErrors.World_AccessDenied if access is denied.
   */
  function requireAccess(ResourceId resourceId, address caller) internal view {
    // Check if the given caller has access to the given namespace or name
    if (!hasAccess(resourceId, caller)) {
      revert IWorldErrors.World_AccessDenied(resourceId.toString(), caller);
    }
  }

  /**
   * @notice Check for ownership of the namespace of the given resource ID.
   * @dev Reverts with IWorldErrors.World_AccessDenied if caller is not owner of the namespace of the resource.
   * @param resourceId The resource ID to check ownership for.
   * @param caller The address of the caller.
   */
  function requireOwner(ResourceId resourceId, address caller) internal view {
    if (NamespaceOwner._get(resourceId.getNamespaceId()) != caller) {
      revert IWorldErrors.World_AccessDenied(resourceId.toString(), caller);
    }
  }
}
