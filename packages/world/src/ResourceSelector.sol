// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library ResourceSelector {
  /**
   * Create a 32-byte resource selector from a namespace and a file.
   *
   * A ResourceSelector is a 32-byte value that uniquely identifies a resource.
   * The first 16 bits represent the namespace, the last 16 bits represent the file.
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
    return string(abi.encodePacked(getNamespace(resourceSelector), "/", getFile(resourceSelector)));
  }

  /**
   * Convert a resource selector to a uint256
   */
  function toUint256(bytes32 resourceSelector) internal pure returns (uint256) {
    return uint256(resourceSelector);
  }
}
