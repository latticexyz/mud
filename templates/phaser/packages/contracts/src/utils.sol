// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

function addressToEntityKey(address addr) pure returns (bytes32) {
  return bytes32(uint256(uint160(addr)));
}
