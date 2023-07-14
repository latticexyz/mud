// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IModule } from "../../../interfaces/IModule.sol";
import { IWorldErrors } from "../../../interfaces/IWorldErrors.sol";
import { System } from "../../../System.sol";
import { Call } from "../../../Call.sol";
import { ResourceSelector } from "../../../ResourceSelector.sol";
import { ResourceAccess, InstalledModules, ResourceAccess, NamespaceOwner } from "../../../Tables.sol";

/**
 * Granting and revoking access from/to resources.
 */
contract AccessManagementSystem is System {
  using ResourceSelector for bytes32;

  /**
   * Returns true if the caller has access to the namespace or name, false otherwise.
   */
  function hasAccess(bytes16 namespace, bytes16 name, address caller) public view returns (bool) {
    return
      _world() == caller || // First check if the World is calling itself
      ResourceAccess.get(ResourceSelector.from(namespace, 0), caller) || // Then check access based on the namespace
      ResourceAccess.get(ResourceSelector.from(namespace, name), caller); // If caller has no namespace access, check access on the name
  }

  /**
   * Check for access at the given namespace or name.
   * Returns the resourceSelector if the caller has access.
   * Reverts with AccessDenied if the caller has no access.
   */
  function requireAccess(
    bytes16 namespace,
    bytes16 name,
    address caller
  ) public view returns (bytes32 resourceSelector) {
    resourceSelector = ResourceSelector.from(namespace, name);

    // Check if the given caller has access to the given namespace or name
    if (!hasAccess(namespace, name, caller)) {
      revert IWorldErrors.AccessDenied(resourceSelector.toString(), caller);
    }
  }

  /**
   * Check for ownership of the given namespace and name (or a World internal call).
   * Returns the resourceSelector if the caller is the owner or World.
   * Reverts with AccessDenied if the caller is not the owner or World.
   */
  function requireOwnerOrWorld(
    bytes16 namespace,
    bytes16 name,
    address caller
  ) public view returns (bytes32 resourceSelector) {
    resourceSelector = ResourceSelector.from(namespace, name);

    if (_world() != caller && NamespaceOwner.get(namespace) != caller) {
      revert IWorldErrors.AccessDenied(resourceSelector.toString(), caller);
    }
  }

  /**
   * Grant access to the resource at the given namespace and name.
   * Requires the caller to own the namespace.
   */
  function grantAccess(bytes16 namespace, bytes16 name, address grantee) public virtual {
    // Require the caller to own the namespace
    bytes32 resourceSelector = requireOwnerOrWorld(namespace, name, _msgSender());

    // Grant access to the given resource
    ResourceAccess.set(resourceSelector, grantee, true);
  }

  /**
   * Revoke access from the resource at the given namespace and name.
   * Requires the caller to own the namespace.
   */
  function revokeAccess(bytes16 namespace, bytes16 name, address grantee) public virtual {
    // Require the caller to own the namespace
    bytes32 resourceSelector = requireOwnerOrWorld(namespace, name, _msgSender());

    // Revoke access from the given resource
    ResourceAccess.deleteRecord(resourceSelector, grantee);
  }
}
