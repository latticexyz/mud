// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Schema } from "@latticexyz/store/src/Schema.sol";
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
   * Call the system at the given resource selector (namespace + name)
   * If the system is not public, the caller must have access to the namespace or name.
   */
  function call(bytes32 resourceSelector, bytes memory funcSelectorAndArgs) external payable returns (bytes memory);
}

/**
 * The IWorldKernel interface includes all methods that are part of the World contract's
 * internal bytecode.
 *
 * Consumers should use the `IBaseWorld` interface instead, which includes dynamically
 * registered functions selectors from the `CoreModule`.
 */
interface IWorldKernel is IWorldModuleInstallation, IWorldCall, IWorldErrors {
  event HelloWorld();
}
