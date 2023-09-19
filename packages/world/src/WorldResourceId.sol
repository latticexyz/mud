// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";

import { ROOT_NAMESPACE, ROOT_NAME } from "./constants.sol";
import { RESOURCE_NAMESPACE, MASK_RESOURCE_NAMESPACE } from "./worldResourceTypes.sol";

bytes16 constant ROOT_NAMESPACE_STRING = bytes16("ROOT_NAMESPACE");
bytes16 constant ROOT_NAME_STRING = bytes16("ROOT_NAME");

bytes32 constant NAMESPACE_MASK = bytes32(~bytes14(""));

// TODO: change all namespace functions to namespace id functions (don't use bytes14 but bytes32 for ownership and access control)
// TODO: should resource id be a user type to avoid type errors of eg passing a namespace (bytes14) instead of a namespace id (bytes32)
// (I ran into a bunch of runtime errors while refactoring this where bytes14 was automatically casted to bytes32)

library WorldResourceIdLib {
  /**
   * Create a 32-byte resource ID from a namespace, name and type.
   *
   * A resource ID is a 32-byte value that uniquely identifies a resource.
   * The first 14 bytes represent the namespace,
   * the next 16 bytes represent the name,
   * the last 2 bytes represent the type.
   *
   * Note: the location of the resource type needs to stay aligned with `ResourceType`
   */
  function encode(
    bytes14 resourceNamespace,
    bytes16 resourceName,
    bytes2 resourceType
  ) internal pure returns (ResourceId) {
    return
      ResourceId.wrap(
        bytes32(resourceNamespace) | ((bytes32(resourceName) >> (14 * 8)) | (bytes32(resourceType) >> (30 * 8)))
      );
  }

  /**
   * Create a 32-byte resource ID from a namespace.
   */
  function encodeNamespace(bytes14 resourceNamespace) internal pure returns (ResourceId) {
    return ResourceId.wrap(bytes32(resourceNamespace) | (bytes32(RESOURCE_NAMESPACE) >> (30 * 8)));
  }

  /**
   * Convert a padded string to a trimmed string (no trailing `null` ASCII characters)
   */
  function toTrimmedString(bytes16 paddedString) internal pure returns (string memory) {
    uint256 length;
    for (; length < 16; length++) if (Bytes.slice1(paddedString, length) == 0) break;
    bytes memory packedSelector = abi.encodePacked(paddedString);
    return string(Bytes.setLength(packedSelector, length));
  }
}

library WorldResourceIdInstance {
  /**
   * Get the namespace of a resource ID.
   */
  function getNamespace(ResourceId resourceId) internal pure returns (bytes14) {
    return bytes14(ResourceId.unwrap(resourceId));
  }

  /**
   * Get the namespace resource ID corresponding to the namespace of a resource ID.
   */
  function getNamespaceId(ResourceId resourceId) internal pure returns (ResourceId) {
    return ResourceId.wrap((ResourceId.unwrap(resourceId) & NAMESPACE_MASK) | MASK_RESOURCE_NAMESPACE);
  }

  /**
   * Get the name of a resource ID.
   */
  function getName(ResourceId resourceId) internal pure returns (bytes16) {
    return bytes16(ResourceId.unwrap(resourceId) << (14 * 8));
  }

  /**
   * Convert a resource ID to a string for more readable logs
   */
  function toString(ResourceId resourceId) internal pure returns (string memory) {
    bytes14 resourceNamespace = getNamespace(resourceId);
    bytes16 resourceName = getName(resourceId);
    bytes2 resourceType = ResourceIdInstance.getType(resourceId);
    return
      string(
        abi.encodePacked(
          resourceNamespace == ROOT_NAMESPACE ? ROOT_NAMESPACE_STRING : resourceNamespace,
          "_",
          resourceName == ROOT_NAME ? ROOT_NAME_STRING : resourceName,
          ".",
          resourceType
        )
      );
  }
}
