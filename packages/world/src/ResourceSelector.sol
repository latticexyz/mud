// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { ROOT_NAMESPACE, ROOT_NAME } from "./constants.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";

/**
 * A ResourceSelector is a 32-byte value that uniquely identifies a resource
 * - 2 bytes for the resource type
 * - 14 bytes for the namespace
 * - 16 bytes for the name
 */
library ResourceSelector {
  /**
   * Create a 32-byte resource selector from the resource type, namespace, and name.
   */
  function from(bytes2 resourceType, bytes14 namespace, bytes16 name) internal pure returns (bytes32) {
    return bytes32(resourceType) | (bytes32(namespace) >> (8 * 2)) | (bytes32(name) >> (8 * 16));
  }

  /**
   * Create a 32-byte resource selector from a resource type and namespace. The selector points to the namespace's root name.
   */
  function from(bytes2 resourceType, bytes14 namespace) internal pure returns (bytes32) {
    return bytes32(resourceType) | (bytes32(namespace) >> (8 * 2));
  }

  /**
   * Get the namespace of a ResourceSelector.
   */
  function getType(bytes32 resourceSelector) internal pure returns (bytes2) {
    return bytes2(resourceSelector);
  }

  /**
   * Get the namespace of a ResourceSelector.
   */
  function getNamespace(bytes32 resourceSelector) internal pure returns (bytes14) {
    return bytes14(resourceSelector << (8 * 2));
  }

  /**
   * Get the name of a ResourceSelector.
   */
  function getName(bytes32 resourceSelector) internal pure returns (bytes16) {
    return bytes16(resourceSelector << (8 * 16));
  }

  /**
   * Convert a selector to a string for more readable logs
   */
  function toString(bytes32 resourceSelector) internal pure returns (string memory) {
    bytes2 resourceType = getType(resourceSelector);
    bytes14 namespace = getNamespace(resourceSelector);
    bytes16 name = getName(resourceSelector);
    return
      string(
        abi.encodePacked(
          resourceType,
          ":",
          // TODO: should we trim these?
          namespace == ROOT_NAMESPACE ? bytes14("ROOT_NAMESPACE") : namespace,
          ":",
          // TODO: should we trim these?
          name == ROOT_NAME ? bytes16("ROOT_NAME") : name
        )
      );
  }

  /**
   * Convert a selector to a trimmed string (no trailing `null` ASCII characters)
   */
  function toTrimmedString(bytes16 selector) internal pure returns (string memory) {
    uint256 length;
    for (; length < 16; length++) if (Bytes.slice1(selector, length) == 0) break;
    bytes memory packedSelector = abi.encodePacked(selector);
    return string(Bytes.setLength(packedSelector, length));
  }
}
