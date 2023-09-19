// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

type ResourceId is bytes32;

library ResourceIdLib {
  function encode(bytes30 resourceName, bytes2 resourceType) internal pure returns (ResourceId) {
    return ResourceId.wrap(bytes32(resourceName) | (bytes32(resourceType) >> (8 * 30)));
  }
}

library ResourceIdInstance {
  function unwrap(ResourceId resourceId) internal pure returns (bytes32) {
    return ResourceId.unwrap(resourceId);
  }

  function getType(ResourceId resourceId) internal pure returns (bytes2) {
    return bytes2(ResourceId.unwrap(resourceId) << (30 * 8));
  }

  function isType(ResourceId resourceId, bytes2 resourceType) internal pure returns (bool) {
    return ResourceId.unwrap(resourceId) & bytes32(resourceType >> (30 * 8)) == bytes32(resourceType >> (30 * 8));
  }
}
