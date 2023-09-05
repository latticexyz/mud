// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "./IStore.sol";
import { Schema } from "./Schema.sol";

// 20 bytes address, 1 byte bitmap of enabled hooks
type StoreHook is bytes21;

enum HookType {
  BEFORE_SET_RECORD,
  AFTER_SET_RECORD,
  BEFORE_SET_FIELD,
  AFTER_SET_FIELD,
  BEFORE_DELETE_RECORD,
  AFTER_DELETE_RECORD
}

struct EnabledHooks {
  bool beforeSetRecord;
  bool afterSetRecord;
  bool beforeSetField;
  bool afterSetField;
  bool beforeDeleteRecord;
  bool afterDeleteRecord;
}

using StoreHookInstance for StoreHook global;

library StoreHookLib {
  /**
   * Encode the bitmap into a single byte
   */
  function encodeBitmap(EnabledHooks memory enabledHooks) internal pure returns (uint8) {
    uint256 bitmap = 0;
    if (enabledHooks.beforeSetRecord) bitmap |= 1 << uint8(HookType.BEFORE_SET_RECORD);
    if (enabledHooks.afterSetRecord) bitmap |= 1 << uint8(HookType.AFTER_SET_RECORD);
    if (enabledHooks.beforeSetField) bitmap |= 1 << uint8(HookType.BEFORE_SET_FIELD);
    if (enabledHooks.afterSetField) bitmap |= 1 << uint8(HookType.AFTER_SET_FIELD);
    if (enabledHooks.beforeDeleteRecord) bitmap |= 1 << uint8(HookType.BEFORE_DELETE_RECORD);
    if (enabledHooks.afterDeleteRecord) bitmap |= 1 << uint8(HookType.AFTER_DELETE_RECORD);
    return uint8(bitmap);
  }

  /**
   * Encode enabled hooks into a bitmap with 1 bit per hook, and pack the bitmap with the store hook address into a bytes21 value
   */
  function encode(IStoreHook storeHook, EnabledHooks memory enabledHooks) internal pure returns (StoreHook) {
    // Move the address to the leftmost 20 bytes and the bitmap to the rightmost byte
    return StoreHook.wrap(bytes21(bytes20(address(storeHook))) | bytes21(uint168(encodeBitmap(enabledHooks))));
  }
}

library StoreHookInstance {
  /**
   * Check if the given hook type is enabled in the store hook
   */
  function isEnabled(StoreHook self, HookType hookType) internal pure returns (bool) {
    // Pick the bitmap encoded in the rightmost byte from the store hook and check if the bit at the given hook type is set
    return (getBitmap(self) & (1 << uint8(hookType))) != 0;
  }

  /**
   * Get the store hook's address
   */
  function getAddress(StoreHook self) internal pure returns (address) {
    // Extract the address from the leftmost 20 bytes
    return address(bytes20(StoreHook.unwrap(self)));
  }

  /**
   * Get the store hook's address casted to the StoreHook type
   */
  function getContract(StoreHook self) internal pure returns (IStoreHook) {
    return IStoreHook(getAddress(self));
  }

  /**
   * Get the store hook's bitmap
   */
  function getBitmap(StoreHook self) internal pure returns (uint8) {
    // Extract the bitmap from the rightmost bytes
    return uint8(uint168(StoreHook.unwrap(self)));
  }
}
