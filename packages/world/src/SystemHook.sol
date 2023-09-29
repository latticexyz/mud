// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ISystemHook, SYSTEM_HOOK_INTERFACE_ID } from "./ISystemHook.sol";
import { ERC165_INTERFACE_ID } from "./IERC165.sol";

/**
 * @title SystemHook
 * @dev The abstract SystemHook contract implements the ERC-165 supportsInterface function for ISystemHook.
 * System hooks are used for executing additional logic before or after certain system actions.
 */
abstract contract SystemHook is ISystemHook {
  /**
   * @notice Checks if the contract implements a given interface.
   * @dev Overridden from IERC165 to include the system hook interface.
   * @param interfaceId The bytes4 interface identifier, as specified in ERC-165.
   * @return true if the contract implements `interfaceId`, false otherwise.
   */
  function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
    return interfaceId == SYSTEM_HOOK_INTERFACE_ID || interfaceId == ERC165_INTERFACE_ID;
  }
}
