// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Bytes } from "@latticexyz/store/src/Bytes.sol";

import { ResourceId, WorldResourceIdInstance, NAMESPACE_BYTES } from "./WorldResourceId.sol";
import { RESOURCE_NAMESPACE } from "./worldResourceTypes.sol";
import { IWorldErrors } from "./IWorldErrors.sol";

using WorldResourceIdInstance for ResourceId;

/**
 * @notice Checks if a given `resourceId` is a namespace.
 * @dev Reverts with IWorldErrors.World_InvalidResourceType if the ID does not have the correct components.
 * @param resourceId The resource ID to verify.
 */
function requireNamespace(ResourceId resourceId) pure {
  requireValidCharacters(resourceId.getNamespace());

  if (ResourceId.unwrap(resourceId) != ResourceId.unwrap(resourceId.getNamespaceId())) {
    revert IWorldErrors.World_InvalidResourceType(RESOURCE_NAMESPACE, resourceId, resourceId.toString());
  }
}

/**
 * @notice Checks if a given namespace string is valid.
 * @dev Reverts with IWorldErrors.World_InvalidNamespace if the namespace includes the reserved separator string ("__").
 * @param namespace The namespace to verify.
 */
function requireValidCharacters(bytes14 namespace) pure {
  for (uint256 i; i < NAMESPACE_BYTES - 1; i++) {
    if (Bytes.slice1(namespace, i) == bytes1("_") && Bytes.slice1(namespace, i + 1) == bytes1("_")) {
      revert IWorldErrors.World_InvalidNamespace(namespace);
    }
  }
}
