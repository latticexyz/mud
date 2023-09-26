// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "./ResourceId.sol";

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

  /**
   * Filter the given hook from the hook list at the given key in the given hook table
   */
  function filterHookListByAddress(
    bytes21[] memory currentHooks,
    address hookAddressToRemove
  ) internal returns (bytes21[] memory newHooks) {
    // Initialize the new hooks array with the same length because we don't know if the hook is registered yet
    newHooks = new bytes21[](currentHooks.length);

    // Filter the array of current hooks
    uint256 newHooksIndex;
    unchecked {
      for (uint256 currentHooksIndex; currentHooksIndex < currentHooks.length; currentHooksIndex++) {
        if (Hook.wrap(currentHooks[currentHooksIndex]).getAddress() != address(hookAddressToRemove)) {
          newHooks[newHooksIndex] = currentHooks[currentHooksIndex];
          newHooksIndex++;
        }
      }
    }

    // Set the new hooks table length in place
    // (Note: this does not update the free memory pointer)
    assembly {
      mstore(newHooks, newHooksIndex)
    }
  }
}

library HookInstance {
  /**
   * Check if the given hook type is enabled in the hook
   */
  function isEnabled(Hook self, uint8 hookTypes) internal pure returns (bool) {
    return (getBitmap(self) & hookTypes) == hookTypes;
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
