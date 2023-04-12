// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceSelector } from "./ResourceSelector.sol";
import { IErrors } from "./interfaces/IErrors.sol";

import { ResourceAccess } from "./tables/ResourceAccess.sol";
import { NamespaceOwner } from "./tables/NamespaceOwner.sol";

library AccessControl {
  using ResourceSelector for bytes32;

  /**
   * Returns true if the caller has access to the namespace or name, false otherwise.
   */
  function hasAccess(bytes16 namespace, bytes16 name, address caller) internal view returns (bool) {
    return
      address(this) == caller || // First check if the World is calling itself
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
  ) internal view returns (bytes32 resourceSelector) {
    resourceSelector = ResourceSelector.from(namespace, name);

    // Check if the given caller has access to the given namespace or name
    if (!hasAccess(namespace, name, caller)) {
      revert IErrors.AccessDenied(resourceSelector.toString(), caller);
    }
  }

  function requireOwnerOrSelf(
    bytes16 namespace,
    bytes16 name,
    address caller
  ) internal view returns (bytes32 resourceSelector) {
    resourceSelector = ResourceSelector.from(namespace, name);

    if (address(this) != caller && NamespaceOwner.get(namespace) != caller) {
      revert IErrors.AccessDenied(resourceSelector.toString(), caller);
    }
  }
}
