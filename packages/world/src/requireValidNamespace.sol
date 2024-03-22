// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Bytes } from "@latticexyz/store/src/Bytes.sol";

import { ResourceId, WorldResourceIdInstance, WorldResourceIdLib } from "./WorldResourceId.sol";
import { IWorldErrors } from "./IWorldErrors.sol";

using WorldResourceIdInstance for ResourceId;

/**
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 */

/**
 * @notice Checks if a given `resourceId` is a valid namespace.
 * @dev Reverts with `IWorldErrors.World_InvalidNamespace` if the namespace includes the reserved `__` separator string or ends with `_`.
 * @param resourceId The resource ID to validate.
 */
function requireValidNamespace(ResourceId resourceId) pure {
  // Require the namespace to not include the reserved separator
  bytes14 namespace = resourceId.getNamespace();
  string memory trimmedNamespace = WorldResourceIdLib.toTrimmedString(namespace);
  uint256 trimmedNamespaceLength = bytes(trimmedNamespace).length;

  if (trimmedNamespaceLength > 0) {
    if (Bytes.getBytes1(bytes(trimmedNamespace), trimmedNamespaceLength - 1) == "_") {
      revert IWorldErrors.World_InvalidNamespace(namespace);
    }

    for (uint256 i; i < trimmedNamespaceLength - 1; i++) {
      if (
        Bytes.getBytes1(bytes(trimmedNamespace), i) == "_" && Bytes.getBytes1(bytes(trimmedNamespace), i + 1) == "_"
      ) {
        revert IWorldErrors.World_InvalidNamespace(namespace);
      }
    }
  }
}
