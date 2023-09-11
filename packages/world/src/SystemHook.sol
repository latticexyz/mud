// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Hook, HookLib } from "@latticexyz/store/src/Hook.sol";
import { ISystemHook } from "./interfaces/ISystemHook.sol";

enum SystemHookType {
  BEFORE_CALL_SYSTEM,
  AFTER_CALL_SYSTEM
}

library SystemHookLib {
  /**
   * Encode the bitmap into a single byte
   */
  function encodeBitmap(bool onBeforeCallSystem, bool onAfterCallSystem) internal pure returns (uint8) {
    uint256 bitmap = 0;
    if (onBeforeCallSystem) bitmap |= 1 << uint8(SystemHookType.BEFORE_CALL_SYSTEM);
    if (onAfterCallSystem) bitmap |= 1 << uint8(SystemHookType.AFTER_CALL_SYSTEM);
    return uint8(bitmap);
  }

  /**
   * Encode enabled hooks into a bitmap with 1 bit per hook, and pack the bitmap with the system hook address into a bytes21 value
   */
  function encode(ISystemHook systemHook, uint8 enabledHooksBitmap) internal pure returns (Hook) {
    return HookLib.encode(address(systemHook), enabledHooksBitmap);
  }
}
