// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ResourceSelector } from "./ResourceSelector.sol";
import { IErrors } from "./interfaces/IErrors.sol";

import { ResourceAccess } from "./tables/ResourceAccess.sol";
import { NamespaceOwner } from "./tables/NamespaceOwner.sol";

library AccessControl {
  using ResourceSelector for bytes32;

  /**
   * Returns true if the caller has access to the namespace or file, false otherwise.
   */
  function hasAccess(bytes16 namespace, bytes16 file, address caller) internal view returns (bool) {
    return
      ResourceAccess.get(ResourceSelector.from(namespace, 0), caller) || // First check access based on the namespace
      ResourceAccess.get(ResourceSelector.from(namespace, file), caller); // If caller has no namespace access, check access on the file
  }

  /**
   * Check for access at the given namespace or file.
   * Returns the resourceSelector if the caller has access.
   * Reverts with AccessDenied if the caller has no access.
   */
  function requireAccess(
    bytes16 namespace,
    bytes16 file,
    address caller
  ) internal view returns (bytes32 resourceSelector) {
    resourceSelector = ResourceSelector.from(namespace, file);

    // Check if the given caller has access to the given namespace or file
    if (!hasAccess(namespace, file, msg.sender)) {
      revert IErrors.AccessDenied(resourceSelector.toString(), caller);
    }
  }

  function requireOwner(
    bytes16 namespace,
    bytes16 file,
    address caller
  ) internal view returns (bytes32 resourceSelector) {
    resourceSelector = ResourceSelector.from(namespace, file);

    if (NamespaceOwner.get(namespace) != msg.sender) {
      revert IErrors.AccessDenied(resourceSelector.toString(), caller);
    }
  }
}
