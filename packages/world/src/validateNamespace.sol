// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Bytes } from "@latticexyz/store/src/Bytes.sol";

import { ResourceId, WorldResourceIdInstance, NAMESPACE_BYTES } from "./WorldResourceId.sol";
import { RESOURCE_NAMESPACE } from "./worldResourceTypes.sol";
import { IWorldErrors } from "./IWorldErrors.sol";

using WorldResourceIdInstance for ResourceId;

/**
 * @notice Checks if a given `resourceId` is a valid namespace.
 * @dev Reverts with IWorldErrors.World_InvalidResourceType if the ID does not have the correct components.
 * @dev Reverts with IWorldErrors.World_InvalidNamespace if the namespace includes the reserved separator string ("__").
 * @param resourceId The resource ID to verify.
 */
function validateNamespace(ResourceId resourceId) pure {
  // Require the resourceId to have the namespace type
  if (ResourceId.unwrap(resourceId) != ResourceId.unwrap(resourceId.getNamespaceId())) {
    revert IWorldErrors.World_InvalidResourceType(RESOURCE_NAMESPACE, resourceId, resourceId.toString());
  }

  // Require the namespace to not include the reserved separator
  bytes14 namespace = resourceId.getNamespace();
  for (uint256 i; i < NAMESPACE_BYTES - 1; i++) {
    if (Bytes.slice1(namespace, i) == bytes1("_") && Bytes.slice1(namespace, i + 1) == bytes1("_")) {
      revert IWorldErrors.World_InvalidNamespace(namespace);
    }
  }
}
