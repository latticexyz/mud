// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IModule } from "../../../interfaces/IModule.sol";
import { System } from "../../../System.sol";
import { AccessControl } from "../../../AccessControl.sol";
import { ResourceSelector } from "../../../ResourceSelector.sol";
import { Call } from "../../../Call.sol";
import { ResourceAccess } from "../../../tables/ResourceAccess.sol";
import { InstalledModules } from "../../../tables/InstalledModules.sol";

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
    AccessControl.requireOwnerOrSelf(resourceSelector, _msgSender());

    // Grant access to the given resource
    ResourceAccess.set(resourceSelector, grantee, true);
  }

  /**
   * Revoke access from the resource at the given namespace and name.
   * Requires the caller to own the namespace.
   */
  function revokeAccess(bytes32 resourceSelector, address grantee) public virtual {
    // Require the caller to own the namespace
    AccessControl.requireOwnerOrSelf(resourceSelector, _msgSender());

    // Revoke access from the given resource
    ResourceAccess.deleteRecord(resourceSelector, grantee);
  }
}
