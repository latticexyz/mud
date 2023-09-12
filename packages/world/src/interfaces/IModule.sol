// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IModule {
  error RequiredModuleNotFound(string resourceSelector);
  error RootInstallModeNotSupported();
  error NonRootInstallNotSupported();

  /**
   * Return the module name as a bytes16.
   */
  function getName() external view returns (bytes16 name);

  /**
   * This function is called by the World as part of `installRootModule`.
   * The module expects to be called via the World contract, and therefore installs itself on the `msg.sender`.
   */
  function installRoot(bytes memory args) external;

  /**
   * This function is called by the World as part of `installModule`.
   * The module expects to be called via the World contract, and therefore installs itself on the `msg.sender`.
   * This function is separate from `installRoot` because the logic might be different (eg. accepting namespace parameters,
   * or using `callFrom`)
   */
  function install(bytes memory args) external;
}
