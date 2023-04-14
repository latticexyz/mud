// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IErrors } from "./IErrors.sol";
import { IModule } from "./IModule.sol";

/**
 * The IWorldData interface includes methods for reading and writing table values.
 * These methods are frequently invoked during runtime, so it is essential to prioritize
 * optimizing their gas cost, and they are part of the World contract's internal bytecode.
 *
 * Consumers should use the `IBaseWorld` interface instead, which includes
 * dynamically registered function selectors (e.g. IWorldRegistration, IRegistrationSystem)
 */
interface IWorldData is IErrors {
  /**
   * Install the given root module in the World.
   * Requires the caller to own the root namespace.
   * The module is delegatecalled and installed in the root namespace.
   */
  function installRootModule(IModule module, bytes memory args) external;

  /************************************************************************
   *
   *    STORE METHODS
   *
   ************************************************************************/

  /**
   * Write a record in the table at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function setRecord(bytes16 namespace, bytes16 name, bytes32[] calldata key, bytes calldata data) external;

  /**
   * Write a field in the table at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function setField(
    bytes16 namespace,
    bytes16 name,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data
  ) external;

  /**
   * Push data to the end of a field in the table at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function pushToField(
    bytes16 namespace,
    bytes16 name,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush
  ) external;

  /**
   * Update data at `startByteIndex` of a field in the table at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function updateInField(
    bytes16 namespace,
    bytes16 name,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet
  ) external;

  /**
   * Delete a record in the table at the given namespace and name.
   * Requires the caller to have access to the namespace or name.
   */
  function deleteRecord(bytes16 namespace, bytes16 name, bytes32[] calldata key) external;

  /************************************************************************
   *
   *    SYSTEM CALLS
   *
   ************************************************************************/

  /**
   * Call the system at the given namespace and name.
   * If the system is not public, the caller must have access to the namespace or name.
   */
  function call(
    bytes16 namespace,
    bytes16 name,
    bytes memory funcSelectorAndArgs
  ) external payable returns (bytes memory);
}
