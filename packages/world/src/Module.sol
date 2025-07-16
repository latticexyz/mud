// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { WorldContextConsumer } from "./WorldContext.sol";
import { IWorldContextConsumer } from "./IWorldContextConsumer.sol";
import { IModule, IModule } from "./IModule.sol";
import { IERC165 } from "./IERC165.sol";
import { InstalledModules } from "./codegen/tables/InstalledModules.sol";

/**
 * @title Module
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Abstract contract that implements the ERC-165 supportsInterface function for IModule.
 */
abstract contract Module is IModule, WorldContextConsumer {
  address internal immutable __self = address(this);

  /**
   * @notice Checks if the given interfaceId is supported by this contract.
   * @dev Overrides the functionality from IERC165 and WorldContextConsumer to check for supported interfaces.
   * @param interfaceId The bytes4 identifier for the interface.
   * @return true if the interface is supported, false otherwise.
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public pure virtual override(IERC165, WorldContextConsumer) returns (bool) {
    return
      interfaceId == type(IModule).interfaceId ||
      interfaceId == type(IWorldContextConsumer).interfaceId ||
      interfaceId == type(IERC165).interfaceId;
  }

  /**
   * @dev Check if a module with the given name and arguments is installed.
   * @param moduleAddress The address of the module.
   * @param encodedArgs The ABI encoded arguments for the module installation.
   * @return true if the module is installed, false otherwise.
   */
  function isInstalled(address moduleAddress, bytes memory encodedArgs) internal view returns (bool) {
    return InstalledModules.get(moduleAddress, keccak256(encodedArgs));
  }

  /**
   * @dev Revert if the module with the given name and arguments is already installed.
   * @param moduleAddress The address of the module.
   * @param encodedArgs The ABI encoded arguments for the module installation.
   */
  function requireNotInstalled(address moduleAddress, bytes memory encodedArgs) internal view {
    if (isInstalled(moduleAddress, encodedArgs)) {
      revert Module_AlreadyInstalled();
    }
  }

  /**
   * @notice Installs the module as a root module.
   * @dev This function is invoked by the World contract during `installRootModule` process.
   * The module expects to be called via the World contract and thus installs itself on the `msg.sender`.
   * @param encodedArgs The ABI encoded arguments that may be needed during the installation process.
   */
  function installRoot(bytes memory encodedArgs) public virtual {
    revert Module_RootInstallNotSupported();
  }

  /**
   * @notice Installs the module.
   * @dev This function is invoked by the World contract during `installModule` process.
   * The module expects to be called via the World contract and thus installs itself on the `msg.sender`.
   * Logic might differ from `installRoot`, for example, this might accept namespace parameters.
   * @param encodedArgs The ABI encoded arguments that may be needed during the installation process.
   */
  function install(bytes memory encodedArgs) public virtual {
    revert Module_NonRootInstallNotSupported();
  }
}
