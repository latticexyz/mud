// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IModule } from "../../../interfaces/IModule.sol";
import { System } from "../../../System.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { ResourceId } from "../../../ResourceId.sol";
import { ResourceAccess } from "../../../tables/ResourceAccess.sol";
import { InstalledModules } from "../../../tables/InstalledModules.sol";
import { NamespaceOwner } from "../../../tables/NamespaceOwner.sol";

/**
 * Granting and revoking access from/to resources.
 */
contract AccessManagementSystem is System {
  /**
   * Grant access to the resource at the given resource ID.
   * Requires the caller to own the namespace.
   */
  function grantAccess(bytes32 resourceId, address grantee) public virtual {
    // Require the caller to own the namespace
    AccessControl.requireOwner(resourceId, _msgSender());

    // Grant access to the given resource
    ResourceAccess._set(resourceId, grantee, true);
  }

  /**
   * Revoke access from the resource at the given resource ID.
   * Requires the caller to own the namespace.
   */
  function revokeAccess(bytes32 resourceId, address grantee) public virtual {
    // Require the caller to own the namespace
    AccessControl.requireOwner(resourceId, _msgSender());

    // Revoke access from the given resource
    ResourceAccess._deleteRecord(resourceId, grantee);
  }

  /**
   * Transfer ownership of the given namespace to newOwner.
   * Revoke ResourceAccess for previous owner and grant to newOwner.
   * Requires the caller to own the namespace.
   */
  function transferOwnership(bytes14 namespace, address newOwner) public virtual {
    ResourceId namespaceId = ResourceId.encodeNamespace(namespace);

    // Require the caller to own the namespace
    AccessControl.requireOwner(namespaceId, _msgSender());

    // Set namespace new owner
    NamespaceOwner._set(namespace, newOwner);

    // Revoke access from old owner
    ResourceAccess._deleteRecord(namespaceId, _msgSender());

    // Grant access to new owner
    ResourceAccess._set(namespaceId, newOwner, true);
  }
}
