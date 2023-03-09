// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library TableId {
  function toString(uint256 tableId) internal pure returns (string memory) {
    return string(abi.encodePacked(tableId));
  }
}
