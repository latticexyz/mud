// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { ResourceId, ResourceIdInstance, TYPE_BITS } from "@latticexyz/store/src/ResourceId.sol";

import { ROOT_NAMESPACE, ROOT_NAME } from "./constants.sol";
import { RESOURCE_NAMESPACE, MASK_RESOURCE_NAMESPACE } from "./worldResourceTypes.sol";

uint256 constant NAMESPACE_BITS = 14 * 8;
uint256 constant NAME_BITS = 16 * 8;

bytes16 constant ROOT_NAMESPACE_STRING = bytes16("ROOT_NAMESPACE");
bytes16 constant ROOT_NAME_STRING = bytes16("ROOT_NAME");

bytes32 constant NAMESPACE_MASK = bytes32(~bytes14("")) >> (TYPE_BITS);

/**
 * @title WorldResourceIdLib
 * @notice A library for handling World Resource ID encoding and decoding.
 */
library WorldResourceIdLib {
  /**
   * @notice Encode a resource ID.
   * @param typeId The resource type ID.
   * @param namespace The namespace of the resource.
   * @param name The name of the resource.
   * @return A 32-byte resource ID.
   */
  function encode(bytes2 typeId, bytes14 namespace, bytes16 name) internal pure returns (ResourceId) {
    return
      ResourceId.wrap(
        bytes32(typeId) | (bytes32(namespace) >> TYPE_BITS) | (bytes32(name) >> (TYPE_BITS + NAMESPACE_BITS))
      );
  }

  /**
   * @notice Encode a namespace to resource ID.
   * @param namespace The namespace to be encoded.
   * @return A 32-byte resource ID with the namespace encoded.
   */
  function encodeNamespace(bytes14 namespace) internal pure returns (ResourceId) {
    return ResourceId.wrap(bytes32(RESOURCE_NAMESPACE) | (bytes32(namespace) >> (TYPE_BITS)));
  }

  /**
   * @notice Convert a padded string to a trimmed string.
   * @param paddedString The input string with potential padding.
   * @return A string without trailing null ASCII characters.
   */
  function toTrimmedString(bytes16 paddedString) internal pure returns (string memory) {
    uint256 length;
    for (; length < 16; length++) if (Bytes.slice1(paddedString, length) == 0) break;
    bytes memory packedSelector = abi.encodePacked(paddedString);
    return string(Bytes.setLength(packedSelector, length));
  }
}

/**
 * @title WorldResourceIdInstance
 * @notice A library for handling instances of World Resource IDs.
 */
library WorldResourceIdInstance {
  /**
   * @notice Get the namespace from a resource ID.
   * @param resourceId The resource ID.
   * @return A 14-byte namespace.
   */
  function getNamespace(ResourceId resourceId) internal pure returns (bytes14) {
    return bytes14(ResourceId.unwrap(resourceId) << (TYPE_BITS));
  }

  /**
   * @notice Get the namespace ID from a resource ID.
   * @param resourceId The resource ID.
   * @return A 32-byte namespace resource ID.
   */
  function getNamespaceId(ResourceId resourceId) internal pure returns (ResourceId) {
    return ResourceId.wrap((ResourceId.unwrap(resourceId) & NAMESPACE_MASK) | MASK_RESOURCE_NAMESPACE);
  }

  /**
   * @notice Get the name from a resource ID.
   * @param resourceId The resource ID.
   * @return A 16-byte name.
   */
  function getName(ResourceId resourceId) internal pure returns (bytes16) {
    return bytes16(ResourceId.unwrap(resourceId) << (TYPE_BITS + NAMESPACE_BITS));
  }

  /**
   * @notice Convert a resource ID to a string.
   * @param resourceId The resource ID.
   * @return A string representation of the resource ID.
   */
  function toString(ResourceId resourceId) internal pure returns (string memory) {
    bytes2 resourceType = ResourceIdInstance.getType(resourceId);
    bytes14 resourceNamespace = getNamespace(resourceId);
    bytes16 resourceName = getName(resourceId);
    return
      string(
        abi.encodePacked(
          resourceType,
          ":",
          resourceNamespace == ROOT_NAMESPACE ? ROOT_NAMESPACE_STRING : resourceNamespace,
          ":",
          resourceName == ROOT_NAME ? ROOT_NAME_STRING : resourceName
        )
      );
  }
}
