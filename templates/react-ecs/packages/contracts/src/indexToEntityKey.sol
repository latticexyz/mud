// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

function indexToEntityKey(uint256 _idx) pure returns (bytes32) {
  return keccak256(abi.encode(_idx));
}
