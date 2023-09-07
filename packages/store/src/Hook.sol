// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// 20 bytes address, 1 byte bitmap of enabled hooks
type Hook is bytes21;

using HookInstance for Hook global;

library HookLib {
  /**
   * Encode enabled hooks into a bitmap with 1 bit per hook, and pack the bitmap with the store hook address into a bytes21 value
   */
  function encode(address hookAddress, uint8 encodedHooks) internal pure returns (Hook) {
    // Move the address to the leftmost 20 bytes and the bitmap to the rightmost byte
    return Hook.wrap(bytes21(bytes20(hookAddress)) | bytes21(uint168(encodedHooks)));
  }
}

library HookInstance {
  /**
   * Check if the given hook type is enabled in the hook
   */
  function isEnabled(Hook self, uint8 hookType) internal pure returns (bool) {
    // Pick the bitmap encoded in the rightmost byte from the hook and check if the bit at the given hook type is set
    return (getBitmap(self) & (1 << uint8(hookType))) != 0;
  }

  /**
   * Get the hook's address
   */
  function getAddress(Hook self) internal pure returns (address) {
    // Extract the address from the leftmost 20 bytes
    return address(bytes20(Hook.unwrap(self)));
  }

  /**
   * Get the store hook's bitmap
   */
  function getBitmap(Hook self) internal pure returns (uint8) {
    // Extract the bitmap from the rightmost bytes
    return uint8(uint168(Hook.unwrap(self)));
  }
}
