// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IErrors } from "./IErrors.sol";
import { ISystemHook } from "./ISystemHook.sol";
import { IModule } from "./IModule.sol";

/**
 * World methods which don't need gas optimizations
 * and can be registered dynamically to reduce World's contract size.
 *
 * Consumers should use the `IBaseWorld` interface instead, which includes
 * static function selectors (IWorldData) and
 * other dynamically registered function selectors (e.g. IRegistrationSystem)
 */
interface IWorldAccess is IErrors {
  /**
   * Install the given module at the given namespace in the World.
   */
  function installModule(IModule module, bytes memory args) external;

  /************************************************************************
   *
   *    ACCESS METHODS
   *
   ************************************************************************/

  /**
   * Grant access to the resource at the given namespace and name.
   * Requires the caller to own the namespace.
   */
  function grantAccess(bytes16 namespace, bytes16 name, address grantee) external;

  /**
   * Retract access from the resource at the given namespace and name.
   */
  function retractAccess(bytes16 namespace, bytes16 name, address grantee) external;
}
