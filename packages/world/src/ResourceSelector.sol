// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { ROOT_NAMESPACE, ROOT_NAME } from "./constants.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";

bytes16 constant ROOT_NAMESPACE_STRING = bytes16("ROOT_NAMESPACE");
bytes16 constant ROOT_NAME_STRING = bytes16("ROOT_NAME");

library ResourceSelector {
  /**
   * Create a 32-byte resource selector from a namespace and a name.
   *
   * A ResourceSelector is a 32-byte value that uniquely identifies a resource.
   * The first 16 bytes represent the namespace, the last 16 bytes represent the name.
   */
  function from(bytes16 namespace, bytes16 name) internal pure returns (bytes32) {
    return bytes32(namespace) | (bytes32(name) >> 128);
  }

  /**
   * Create a 32-byte resource selector from a namespace. The selector points to the namespace's root name.
   */
  function from(bytes16 namespace) internal pure returns (bytes32) {
    return bytes32(namespace);
  }

  /**
   * Get the namespace of a ResourceSelector.
   */
  function getNamespace(bytes32 resourceSelector) internal pure returns (bytes16) {
    return bytes16(resourceSelector);
  }

  /**
   * Get the name of a ResourceSelector.
   */
  function getName(bytes32 resourceSelector) internal pure returns (bytes16) {
    return bytes16(resourceSelector << 128);
  }

  /**
   * Convert a selector to a string for more readable logs
   */
  function toString(bytes32 resourceSelector) internal pure returns (string memory) {
    bytes16 namespace = getNamespace(resourceSelector);
    bytes16 name = getName(resourceSelector);
    return
      string(
        abi.encodePacked(
          namespace == ROOT_NAMESPACE ? ROOT_NAMESPACE_STRING : namespace,
          "/",
          name == ROOT_NAME ? ROOT_NAME_STRING : name
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
