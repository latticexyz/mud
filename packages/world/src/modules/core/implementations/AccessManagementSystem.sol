// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IModule } from "../../../interfaces/IModule.sol";
import { System } from "../../../System.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { Call } from "../../../Call.sol";
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
  function grantAccess(bytes16 namespace, bytes16 name, address grantee) public virtual {
    // Require the caller to own the namespace
    bytes32 resourceSelector = AccessControl.requireOwnerOrSelf(namespace, name, _msgSender());

    // Grant access to the given resource
    ResourceAccess.set(resourceSelector, grantee, true);
  }

  /**
   * Revoke access from the resource at the given namespace and name.
   * Requires the caller to own the namespace.
   */
  function revokeAccess(bytes16 namespace, bytes16 name, address grantee) public virtual {
    // Require the caller to own the namespace
    bytes32 resourceSelector = AccessControl.requireOwnerOrSelf(namespace, name, _msgSender());

    // Revoke access from the given resource
    ResourceAccess.deleteRecord(resourceSelector, grantee);
  }

  /**
   * Transfer ownership of the given namespace to newOwner.
   * Revoke ResourceAccess for previous owner and grant to newOwner.
   * Requires the caller to own the namespace.
   */
  function transferOwner(bytes16 namespace, address newOwner) public virtual {
    // Require the caller to own the namespace
    bytes32 resourceSelector = AccessControl.requireOwnerOrSelf(namespace, 0, _msgSender());
    // Grant access to new owner
    ResourceAccess.set(resourceSelector, newOwner, true);
    // Set namespace new owner
    NamespaceOwner.set(namespace, newOwner);
    // Revoke access from old owner
    ResourceAccess.deleteRecord(resourceSelector, _msgSender());
  }
}
