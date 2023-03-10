// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { ROOT_NAMESPACE, ROOT_FILE } from "./constants.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";

library ResourceSelector {
  /**
   * Create a 32-byte resource selector from a namespace and a file.
   *
   * A ResourceSelector is a 32-byte value that uniquely identifies a resource.
   * The first 16 bytes represent the namespace, the last 16 bytes represent the file.
   */
  function from(bytes16 namespace, bytes16 file) internal pure returns (bytes32) {
    return bytes32(namespace) | (bytes32(file) >> 128);
  }

  /**
   * Create a 32-byte resource selector from a namespace. The selector points to the namespace's root file.
   */
  function from(bytes16 namespace) internal pure returns (bytes32) {
    return bytes32(namespace);
  }

  /**
   * Create a 32-byte resource selector from a uint256 tableId
   */
  function from(uint256 tableId) internal pure returns (bytes32) {
    return bytes32(tableId);
  }

  /**
   * Get the namespace of a ResourceSelector.
   */
  function getNamespace(bytes32 resourceSelector) internal pure returns (bytes16) {
    return bytes16(resourceSelector);
  }

  /**
   * Get the file of a ResourceSelector.
   */
  function getFile(bytes32 resourceSelector) internal pure returns (bytes16) {
    return bytes16(resourceSelector << 128);
  }

  /**
   * Convert a selector to a string for more readable logs
   */
  function toString(bytes32 resourceSelector) internal pure returns (string memory) {
    bytes16 namespace = getNamespace(resourceSelector);
    bytes16 file = getFile(resourceSelector);
    return
      string(
        abi.encodePacked(
          namespace == ROOT_NAMESPACE ? bytes16("ROOT_NAMESPACE") : namespace,
          "/",
          file == ROOT_FILE ? bytes16("ROOT_FILE") : file
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

  /**
   * Convert a resource selector to a tableId
   */
  function toTableId(bytes32 resourceSelector) internal pure returns (uint256) {
    return uint256(resourceSelector);
  }
}
