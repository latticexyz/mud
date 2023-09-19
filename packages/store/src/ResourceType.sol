// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library ResourceType {
  function encode(bytes30 resourceName, bytes2 resourceType) internal pure returns (bytes32) {
    return bytes32(resourceName) | (bytes32(resourceType) >> (8 * 30));
  }

  function getType(bytes32 resourceId) internal pure returns (bytes2) {
    return bytes2(resourceId << (30 * 8));
  }

  function isType(bytes32 resourceId, bytes2 resourceType) internal pure returns (bool) {
    return resourceId & bytes32(resourceType >> (30 * 8)) == bytes32(resourceType >> (30 * 8));
  }
}
