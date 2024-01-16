// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

/**
 * @title ResourceId type definition and related utilities
 * @dev A ResourceId is a bytes32 data structure that consists of a
 * type and a name
 */
type ResourceId is bytes32;

/// @dev Number of bits reserved for the type in the ResourceId.
uint256 constant TYPE_BITS = 2 * 8; // 2 bytes * 8 bits per byte

/**
 * @title ResourceIdLib Library
 * @dev Provides functions to encode data into the ResourceId
 */
library ResourceIdLib {
  /**
   * @notice Encodes given typeId and name into a ResourceId.
   * @param typeId The type identifier to be encoded. Must be 2 bytes.
   * @param name The name to be encoded. Must be 30 bytes.
   * @return A ResourceId containing the encoded typeId and name.
   */
  function encode(bytes2 typeId, bytes30 name) internal pure returns (ResourceId) {
    return ResourceId.wrap(bytes32(typeId) | (bytes32(name) >> TYPE_BITS));
  }
}

/**
 * @title ResourceIdInstance Library
 * @dev Provides functions to extract data from a ResourceId.
 */
library ResourceIdInstance {
  /**
   * @notice Extracts the type identifier from a given ResourceId.
   * @param resourceId The ResourceId from which the type identifier should be extracted.
   * @return The extracted 2-byte type identifier.
   */
  function getType(ResourceId resourceId) internal pure returns (bytes2) {
    return bytes2(ResourceId.unwrap(resourceId));
  }
}
