// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

// @dev Provides information about the current execution context
// We only use it in these contracts in case we want to extend it in the future
abstract contract Context {
  function _msgSender() internal view virtual returns (address) {
    return msg.sender;
  }
}
