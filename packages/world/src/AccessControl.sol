// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId, WorldResourceIdInstance } from "./WorldResourceId.sol";
import { IWorldErrors } from "./interfaces/IWorldErrors.sol";

import { ResourceAccess } from "./tables/ResourceAccess.sol";
import { NamespaceOwner } from "./tables/NamespaceOwner.sol";

library AccessControl {
  using WorldResourceIdInstance for ResourceId;

  /**
   * Returns true if the caller has access to the namespace or name, false otherwise.
   */
  function hasAccess(ResourceId resourceId, address caller) internal view returns (bool) {
    return
      ResourceAccess._get(resourceId.getNamespaceId(), caller) || ResourceAccess._get(resourceId, caller); // First check access based on the namespace // If caller has no namespace access, check access on the name
  }

  /**
   * Check for access at the given namespace or name.
   * Reverts with World_AccessDenied if the caller has no access.
   */
  function requireAccess(ResourceId resourceId, address caller) internal view {
    // Check if the given caller has access to the given namespace or name
    if (!hasAccess(resourceId, caller)) {
      revert IWorldErrors.World_AccessDenied(resourceId.toString(), caller);
    }
  }

  /**
   * Check for ownership of the namespace of the given resource ID.
   * Reverts with World_AccessDenied if the check fails.
   */
  function requireOwner(ResourceId resourceId, address caller) internal view {
    if (NamespaceOwner._get(resourceId.getNamespaceId()) != caller) {
      revert IWorldErrors.World_AccessDenied(resourceId.toString(), caller);
    }
  }
}
