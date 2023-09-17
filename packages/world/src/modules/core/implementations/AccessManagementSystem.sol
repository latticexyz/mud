// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IModule } from "../../../interfaces/IModule.sol";
import { System } from "../../../System.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { ResourceSelector } from "../../../ResourceSelector.sol";
import { ResourceAccess } from "../../../tables/ResourceAccess.sol";
import { InstalledModules } from "../../../tables/InstalledModules.sol";
import { NamespaceOwner } from "../../../tables/NamespaceOwner.sol";

/**
 * Granting and revoking access from/to resources.
 */
contract AccessManagementSystem is System {
  /**
   * Grant access to the resource at the given namespace and name.
   * Requires the caller to own the namespace.
   */
  function grantAccess(bytes32 resourceSelector, address grantee) public virtual {
    // Require the caller to own the namespace
    AccessControl.requireOwner(resourceSelector, _msgSender());

    // Grant access to the given resource
    ResourceAccess._set(resourceSelector, grantee, true);
  }

  /**
   * Revoke access from the resource at the given namespace and name.
   * Requires the caller to own the namespace.
   */
  function revokeAccess(bytes32 resourceSelector, address grantee) public virtual {
    // Require the caller to own the namespace
    AccessControl.requireOwner(resourceSelector, _msgSender());

    // Revoke access from the given resource
    ResourceAccess._deleteRecord(resourceSelector, grantee);
  }

  /**
   * Transfer ownership of the given namespace to newOwner.
   * Revoke ResourceAccess for previous owner and grant to newOwner.
   * Requires the caller to own the namespace.
   */
  function transferOwnership(bytes16 namespace, address newOwner) public virtual {
    // Require the caller to own the namespace
    AccessControl.requireOwner(namespace, _msgSender());

    // Set namespace new owner
    NamespaceOwner._set(namespace, newOwner);

    // Revoke access from old owner
    ResourceAccess._deleteRecord(namespace, _msgSender());

    // Grant access to new owner
    ResourceAccess._set(namespace, newOwner, true);
  }
}
