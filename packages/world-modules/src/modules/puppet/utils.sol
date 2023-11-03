// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

function toTopic(address value) pure returns (bytes32) {
  return bytes32(uint256(uint160(value)));
}

function toTopic(uint256 value) pure returns (bytes32) {
  return bytes32(value);
}
