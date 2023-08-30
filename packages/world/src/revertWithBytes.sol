// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/**
 * Utility function to revert with raw bytes (eg. coming from a low level call or from a previously encoded error)
 */
function revertWithBytes(bytes memory reason) pure {
  assembly {
    // reason+32 is a pointer to the error message, mload(reason) is the length of the error message
    revert(add(reason, 0x20), mload(reason))
  }
}
