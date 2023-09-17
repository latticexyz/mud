// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Hook, HookLib } from "@latticexyz/store/src/Hook.sol";
import { ISystemHook, SYSTEM_HOOK_INTERFACE_ID } from "./interfaces/ISystemHook.sol";
import { ERC165_INTERFACE_ID } from "./interfaces/IERC165.sol";

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

abstract contract SystemHook is ISystemHook {
  // ERC-165 supportsInterface (see https://eips.ethereum.org/EIPS/eip-165)
  function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
    return interfaceId == SYSTEM_HOOK_INTERFACE_ID || interfaceId == ERC165_INTERFACE_ID;
  }
}
