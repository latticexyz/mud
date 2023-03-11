// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// TODO: this is very similar to the trusted forwarder pattern now, maybe align naming?
contract WithMsgSender {
  // Extract the trusted msg.sender value appended to the calldata
  function _msgSender() internal view returns (address sender) {
    assembly {
      // 96 = 256 - 20 * 8
      sender := shr(96, calldataload(sub(calldatasize(), 20)))
    }
    if (sender == address(0)) return msg.sender;
  }
}
