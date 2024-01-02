// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { WorldContextConsumer } from "./WorldContext.sol";
import { IModule, MODULE_INTERFACE_ID } from "./IModule.sol";
import { IERC165, ERC165_INTERFACE_ID } from "./IERC165.sol";
import { InstalledModules } from "./codegen/tables/InstalledModules.sol";

/**
 * @title Module
 * @dev Abstract contract that implements the ERC-165 supportsInterface function for IModule.
 */
abstract contract Module is IModule, WorldContextConsumer {
  /**
   * @notice Checks if the given interfaceId is supported by this contract.
   * @dev Overrides the functionality from IERC165 and WorldContextConsumer to check for supported interfaces.
   * @param interfaceId The bytes4 identifier for the interface.
   * @return true if the interface is supported, false otherwise.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public pure virtual override(IERC165, WorldContextConsumer) returns (bool) {
    return interfaceId == MODULE_INTERFACE_ID || interfaceId == ERC165_INTERFACE_ID;
  }

  /**
   * Check if a module with the given name and arguments is installed.
   */
  function isInstalled(bytes16 moduleName, bytes memory args) internal view returns (bool) {
    return InstalledModules.get(moduleName, keccak256(args)) != address(0);
  }

  /**
   * Revert if the module with the given name and arguments is already installed.
   */
  function requireNotInstalled(bytes16 moduleName, bytes memory args) internal view {
    if (isInstalled(moduleName, args)) {
      revert Module_AlreadyInstalled();
    }
  }
}
