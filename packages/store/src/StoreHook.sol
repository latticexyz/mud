// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook, STORE_HOOK_INTERFACE_ID } from "./IStoreHook.sol";
import { ERC165_INTERFACE_ID } from "./IERC165.sol";

abstract contract StoreHook is IStoreHook {
  // ERC-165 supportsInterface (see https://eips.ethereum.org/EIPS/eip-165)
  function supportsInterface(bytes4 interfaceId) public pure virtual returns (bool) {
    return interfaceId == STORE_HOOK_INTERFACE_ID || interfaceId == ERC165_INTERFACE_ID;
  }
}
