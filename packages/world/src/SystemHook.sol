// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { ISystemHook, SYSTEM_HOOK_INTERFACE_ID } from "./interfaces/ISystemHook.sol";
import { ERC165_INTERFACE_ID } from "./interfaces/IERC165.sol";

abstract contract SystemHook is ISystemHook {
  // ERC-165 supportsInterface (see https://eips.ethereum.org/EIPS/eip-165)
  function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
    return interfaceId == SYSTEM_HOOK_INTERFACE_ID || interfaceId == ERC165_INTERFACE_ID;
  }
}
