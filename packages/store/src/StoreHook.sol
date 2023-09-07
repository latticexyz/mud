// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Hook, HookLib } from "./Hook.sol";
import { IStoreHook } from "./IStore.sol";

enum StoreHookType {
  BEFORE_SET_RECORD,
  AFTER_SET_RECORD,
  BEFORE_SET_FIELD,
  AFTER_SET_FIELD,
  BEFORE_DELETE_RECORD,
  AFTER_DELETE_RECORD
}

library StoreHookLib {
  /**
   * Encode the bitmap into a single byte
   */
  function encodeBitmap(
    bool onBeforeSetRecord,
    bool onAfterSetRecord,
    bool onBeforeSetField,
    bool onAfterSetField,
    bool onBeforeDeleteRecord,
    bool onAfterDeleteRecord
  ) internal pure returns (uint8) {
    uint256 bitmap = 0;
    if (onBeforeSetRecord) bitmap |= 1 << uint8(StoreHookType.BEFORE_SET_RECORD);
    if (onAfterSetRecord) bitmap |= 1 << uint8(StoreHookType.AFTER_SET_RECORD);
    if (onBeforeSetField) bitmap |= 1 << uint8(StoreHookType.BEFORE_SET_FIELD);
    if (onAfterSetField) bitmap |= 1 << uint8(StoreHookType.AFTER_SET_FIELD);
    if (onBeforeDeleteRecord) bitmap |= 1 << uint8(StoreHookType.BEFORE_DELETE_RECORD);
    if (onAfterDeleteRecord) bitmap |= 1 << uint8(StoreHookType.AFTER_DELETE_RECORD);
    return uint8(bitmap);
  }

  /**
   * Encode enabled hooks into a bitmap with 1 bit per hook, and pack the bitmap with the store hook address into a bytes21 value
   */
  function encode(IStoreHook storeHook, uint8 enabledHooksBitmap) internal pure returns (Hook) {
    return HookLib.encode(address(storeHook), enabledHooksBitmap);
  }
}
