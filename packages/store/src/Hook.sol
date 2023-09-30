// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Hooks } from "./codegen/tables/Hooks.sol";
import { ResourceId } from "./ResourceId.sol";

// 20 bytes address, 1 byte bitmap of enabled hooks
type Hook is bytes21;

using HookInstance for Hook global;

/**
 * @title HookLib
 * @dev Library for encoding hooks and filtering hooks from a list by address.
 */
library HookLib {
  /**
   * @notice Packs the bitmap of enabled hooks with the hook address into a Hook value (bytes21).
   * @dev The hook address is stored in the leftmost 20 bytes, and the bitmap is stored in the rightmost byte.
   * @param hookAddress The address of the hook.
   * @param encodedHooks The encoded hooks in a bitmap.
   * @return A Hook type with packed hook address and bitmap.
   */
  function encode(address hookAddress, uint8 encodedHooks) internal pure returns (Hook) {
    // Move the address to the leftmost 20 bytes and the bitmap to the rightmost byte
    return Hook.wrap(bytes21(bytes20(hookAddress)) | bytes21(uint168(encodedHooks)));
  }

  /**
   * @notice Filter a hook from the hook list by its address.
   * @dev This function writes the updated hook list to the table in place.
   * @param hookTableId The resource ID of the hook table.
   * @param tableWithHooks The resource ID of the table with hooks to filter.
   * @param hookAddressToRemove The address of the hook to remove.
   */
  function filterListByAddress(
    ResourceId hookTableId,
    ResourceId tableWithHooks,
    address hookAddressToRemove
  ) internal {
    bytes21[] memory currentHooks = Hooks._get(hookTableId, tableWithHooks);

    // Initialize the new hooks array with the same length because we don't know if the hook is registered yet
    bytes21[] memory newHooks = new bytes21[](currentHooks.length);

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

    // Set the new hooks table
    Hooks._set(hookTableId, tableWithHooks, newHooks);
  }
}

/**
 * @title HookInstance
 * @dev Library for interacting with Hook instances.
 **/
library HookInstance {
  /**
   * @notice Check if the given hook types are enabled in the hook.
   * @dev We check multiple hook types at once by using a bitmap.
   * @param self The Hook instance to check.
   * @param hookTypes A bitmap of hook types to check.
   * @return True if the hook types are enabled, false otherwise.
   */
  function isEnabled(Hook self, uint8 hookTypes) internal pure returns (bool) {
    return (getBitmap(self) & hookTypes) == hookTypes;
  }

  /**
   * @notice Get the address from the hook.
   * @dev The address is stored in the leftmost 20 bytes.
   * @param self The Hook instance to get the address from.
   * @return The address contained in the Hook instance.
   */
  function getAddress(Hook self) internal pure returns (address) {
    // Extract the address from the leftmost 20 bytes
    return address(bytes20(Hook.unwrap(self)));
  }

  /**
   * @notice Get the bitmap from the hook.
   * @dev The bitmap is stored in the rightmost byte.
   * @param self The Hook instance to get the bitmap from.
   * @return The bitmap contained in the Hook instance.
   */
  function getBitmap(Hook self) internal pure returns (uint8) {
    // Extract the bitmap from the rightmost bytes
    return uint8(uint168(Hook.unwrap(self)));
  }
}
