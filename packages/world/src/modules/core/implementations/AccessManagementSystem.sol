// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IModule } from "../../../IModule.sol";
import { System } from "../../../System.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { ResourceId, WorldResourceIdLib } from "../../../WorldResourceId.sol";
import { ResourceAccess } from "../../../codegen/tables/ResourceAccess.sol";
import { InstalledModules } from "../../../codegen/tables/InstalledModules.sol";
import { NamespaceOwner } from "../../../codegen/tables/NamespaceOwner.sol";

/**
 * @title Access Management System
 * @dev This contract manages the granting and revoking of access from/to resources.
 */
contract AccessManagementSystem is System {
  /**
   * @notice Grant access to the resource at the given resource ID.
   * @dev Requires the caller to own the namespace.
   * @param resourceId The ID of the resource to grant access to.
   * @param grantee The address to which access should be granted.
   */
  function grantAccess(ResourceId resourceId, address grantee) public virtual {
    // Require the caller to own the namespace
    AccessControl.requireOwner(resourceId, _msgSender());

    // Grant access to the given resource
    ResourceAccess._set(resourceId, grantee, true);
  }

  /**
   * @notice Revoke access from the resource at the given resource ID.
   * @dev Requires the caller to own the namespace.
   * @param resourceId The ID of the resource to revoke access from.
   * @param grantee The address from which access should be revoked.
   */
  function revokeAccess(ResourceId resourceId, address grantee) public virtual {
    // Require the caller to own the namespace
    AccessControl.requireOwner(resourceId, _msgSender());

    // Revoke access from the given resource
    ResourceAccess._deleteRecord(resourceId, grantee);
  }

  /**
   * @notice Transfer ownership of the given namespace to newOwner and manages the access.
   * @dev Requires the caller to own the namespace. Revoke ResourceAccess for previous owner and grant to newOwner.
   * @param namespaceId The ID of the namespace to transfer ownership.
   * @param newOwner The address to which ownership should be transferred.
   */
  function transferOwnership(ResourceId namespaceId, address newOwner) public virtual {
    // Require the caller to own the namespace
    AccessControl.requireOwner(namespaceId, _msgSender());

    // Set namespace new owner
    NamespaceOwner._set(namespaceId, newOwner);

    // Revoke access from old owner
    ResourceAccess._deleteRecord(namespaceId, _msgSender());

    // Grant access to new owner
    ResourceAccess._set(namespaceId, newOwner, true);
  }
}
