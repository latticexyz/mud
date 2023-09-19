// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceId } from "./ResourceId.sol";
import { IWorldErrors } from "./interfaces/IWorldErrors.sol";

import { ResourceAccess } from "./tables/ResourceAccess.sol";
import { NamespaceOwner } from "./tables/NamespaceOwner.sol";

library AccessControl {
  using ResourceId for bytes32;

  /**
   * Returns true if the caller has access to the namespace or name, false otherwise.
   */
  function hasAccess(bytes32 resourceId, address caller) internal view returns (bool) {
    return
      address(this) == caller || // First check if the World is calling itself // TODO: remove this check?
      ResourceAccess._get(resourceId.getNamespaceId(), caller) || // Then check access based on the namespace
      ResourceAccess._get(resourceId, caller); // If caller has no namespace access, check access on the name
  }

  /**
   * Check for access at the given namespace or name.
   * Reverts with AccessDenied if the caller has no access.
   */
  function requireAccess(bytes32 resourceId, address caller) internal view {
    // Check if the given caller has access to the given namespace or name
    if (!hasAccess(resourceId, caller)) {
      revert IWorldErrors.AccessDenied(resourceId.toString(), caller);
    }
  }

  /**
   * Check for ownership of the namespace of the given resource ID.
   * Reverts with AccessDenied if the check fails.
   */
  function requireOwner(bytes32 resourceId, address caller) internal view {
    if (NamespaceOwner._get(resourceId.getNamespace()) != caller) {
      revert IWorldErrors.AccessDenied(resourceId.toString(), caller);
    }
  }
}
