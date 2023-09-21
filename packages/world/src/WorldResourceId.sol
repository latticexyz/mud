// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { ResourceId, ResourceIdInstance, TYPE_BYTES } from "@latticexyz/store/src/ResourceId.sol";

import { ROOT_NAMESPACE, ROOT_NAME } from "./constants.sol";
import { RESOURCE_NAMESPACE, MASK_RESOURCE_NAMESPACE } from "./worldResourceTypes.sol";

uint256 constant NAMESPACE_BYTES = 14;
uint256 constant NAME_BYTES = 16;
uint256 constant BYTES_TO_BITS = 8;

bytes16 constant ROOT_NAMESPACE_STRING = bytes16("ROOT_NAMESPACE");
bytes16 constant ROOT_NAME_STRING = bytes16("ROOT_NAME");

bytes32 constant NAMESPACE_MASK = bytes32(~bytes14(""));

library WorldResourceIdLib {
  /**
   * Create a 32-byte resource ID from a namespace, name and type.
   *
   * A resource ID is a 32-byte value that uniquely identifies a resource.
   * The first 14 bytes represent the namespace,
   * the next 16 bytes represent the name,
   * the last 2 bytes represent the type.
   */
  function encode(bytes2 typeId, bytes14 namespace, bytes16 name) internal pure returns (ResourceId) {
    return
      ResourceId.wrap(
        bytes32(namespace) |
          (bytes32(name) >> (NAMESPACE_BYTES * BYTES_TO_BITS)) |
          (bytes32(typeId) >> ((NAMESPACE_BYTES + NAME_BYTES) * BYTES_TO_BITS))
      );
  }

  /**
   * Create a 32-byte resource ID from a namespace.
   */
  function encodeNamespace(bytes14 namespace) internal pure returns (ResourceId) {
    return
      ResourceId.wrap(
        bytes32(namespace) | (bytes32(RESOURCE_NAMESPACE) >> ((NAMESPACE_BYTES + NAME_BYTES) * BYTES_TO_BITS))
      );
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
    return bytes16(ResourceId.unwrap(resourceId) << (NAMESPACE_BYTES * BYTES_TO_BITS));
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
          ":",
          resourceName == ROOT_NAME ? ROOT_NAME_STRING : resourceName,
          ":",
          resourceType
        )
      );
  }
}
