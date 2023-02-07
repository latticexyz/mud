// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract System {
  // Extract the trusted msg.sender value appended to the calldata
  function _msgSender() internal pure returns (address sender) {
    assembly {
      // 96 = 256 - 20 * 8
      sender := shr(96, calldataload(sub(calldatasize(), 20)))
    }
  }
}
