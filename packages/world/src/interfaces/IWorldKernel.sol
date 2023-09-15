// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorldErrors } from "./IWorldErrors.sol";
import { IModule } from "./IModule.sol";

interface IWorldModuleInstallation {
  /**
   * Install the given root module in the World.
   * Requires the caller to own the root namespace.
   * The module is delegatecalled and installed in the root namespace.
   */
  function installRootModule(IModule module, bytes memory args) external;
}

interface IWorldCall {
  /**
   * Call the system at the given resourceSelector.
   * If the system is not public, the caller must have access to the namespace or name (encoded in the resourceSelector).
   */
  function call(bytes32 resourceSelector, bytes memory funcSelectorAndArgs) external payable returns (bytes memory);

  /**
   * Call the system at the given resourceSelector on behalf of the given delegator.
   * If the system is not public, the delegator must have access to the namespace or name (encoded in the resourceSelector).
   */
  function callFrom(
    address delegator,
    bytes32 resourceSelector,
    bytes memory funcSelectorAndArgs
  ) external payable returns (bytes memory);
}

/**
 * The IWorldKernel interface includes all methods that are part of the World contract's
 * internal bytecode.
 *
 * Consumers should use the `IBaseWorld` interface instead, which includes dynamically
 * registered functions selectors from the `CoreModule`.
 */
interface IWorldKernel is IWorldModuleInstallation, IWorldCall, IWorldErrors {
  event HelloWorld(bytes32 indexed worldVersion);

  /**
   * The version of the World.
   */
  function worldVersion() external view returns (bytes32);

  /**
   * The immutable original deployer of the World.
   */
  function creator() external view returns (address);

  /**
   * Allows the creator of the World to initialize the World once.
   */
  function initialize(IModule coreModule) external;
}
