// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/**
 * @title IModuleErrors
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This interface includes errors for the Module library.
 * @dev We bundle these errors in an interface (instead of at the file-level or in their corresponding library) so they can be inherited by IWorldKernel.
 * This ensures that all errors are included in the IWorldKernel ABI for proper decoding in the frontend.
 */
interface IModuleErrors {
  /**
   * @notice Error raised if installing in root is not supported.
   */
  error Module_RootInstallNotSupported();
  /**
   * @notice Error raised if installing in non-root is not supported.
   */
  error Module_NonRootInstallNotSupported();
  /**
   * @notice Error raised if the provided module is already installed.
   */
  error Module_AlreadyInstalled();
  /**
   * @notice Error raised if the provided module is missing a dependency.
   * @param dependency The address of the dependency.
   */
  error Module_MissingDependency(address dependency);
}
