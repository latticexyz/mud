// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IERC165 } from "./IERC165.sol";

/**
 * @title IModule
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Interface for the Module system.
 * A module can be installed within the context of a world, either as a root or non-root module.
 * This interface adheres to the ERC-165 standard for determining interface support.
 */
interface IModule is IERC165 {
  /// @dev Errors to represent non-support of specific installation types.
  error Module_RootInstallNotSupported();
  error Module_RootRegisterNotSupported();
  error Module_NonRootInstallNotSupported();
  error Module_AlreadyInstalled();
  error Module_MissingDependency(address dependency);

  /**
   * @notice Installs the module as a root module.
   * @dev This function is invoked by the World contract during `installRootModule` process.
   * The module expects to be called via the World contract and thus installs itself on the `msg.sender`.
   * @param encodedArgs The ABI encoded arguments that may be needed during the installation process.
   */
  function installRoot(bytes memory encodedArgs) external;
  /**
   * @notice Register function selectors.
   * @dev This function breaks down the tasks in the installRoot function. Can work well with zkEVM..
   * @param encodedArgs The ABI encoded arguments that may be needed during the installation process.
   */
  function registerRoot(bytes memory encodedArgs) external;

  /**
   * @notice Installs the module.
   * @dev This function is invoked by the World contract during `installModule` process.
   * The module expects to be called via the World contract and thus installs itself on the `msg.sender`.
   * Logic might differ from `installRoot`, for example, this might accept namespace parameters.
   * @param encodedArgs The ABI encoded arguments that may be needed during the installation process.
   */
  function install(bytes memory encodedArgs) external;
}
