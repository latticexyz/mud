// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

function entityToAddress(uint256 entity) pure returns (address) {
  return address(uint160(entity));
}

function addressToEntity(address addr) pure returns (uint256) {
  return uint256(uint160(addr));
}
