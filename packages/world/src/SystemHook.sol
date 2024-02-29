// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ISystemHook } from "./ISystemHook.sol";
import { IERC165 } from "./IERC165.sol";

/**
 * @title SystemHook
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
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
    return interfaceId == type(ISystemHook).interfaceId || interfaceId == type(IERC165).interfaceId;
  }
}
