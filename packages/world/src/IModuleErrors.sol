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
  /// @dev Errors to represent non-support of specific installation types.
  error Module_RootInstallNotSupported();
  error Module_NonRootInstallNotSupported();
  error Module_AlreadyInstalled();
  error Module_MissingDependency(address dependency);
}
