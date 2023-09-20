// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

type ResourceId is bytes32;

uint256 constant TYPE_BYTES = 2;
uint256 constant NAME_BYTES = 32 - TYPE_BYTES;
uint256 constant BYTES_TO_BITS = 8;

bytes32 constant TYPE_MASK = bytes32(hex"ffff") >> (NAME_BYTES * BYTES_TO_BITS);

library ResourceIdLib {
  function encode(bytes30 resourceName, bytes2 resourceType) internal pure returns (ResourceId) {
    return ResourceId.wrap(bytes32(resourceName) | (bytes32(resourceType) >> (NAME_BYTES * BYTES_TO_BITS)));
  }
}

library ResourceIdInstance {
  function getType(ResourceId resourceId) internal pure returns (bytes2) {
    return bytes2(ResourceId.unwrap(resourceId) << (NAME_BYTES * BYTES_TO_BITS));
  }

  function isType(ResourceId resourceId, bytes2 resourceType) internal pure returns (bool) {
    return ResourceId.unwrap(resourceId) & TYPE_MASK == bytes32(resourceType) >> (NAME_BYTES * BYTES_TO_BITS);
  }
}
