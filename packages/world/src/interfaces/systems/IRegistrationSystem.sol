// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "@latticexyz/store/src/Store.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { System } from "../../System.sol";

import { ISystemHook } from "../ISystemHook.sol";

// TODO: autogenerate

interface IRegistrationSystem {
  /**
   * Register a new namespace
   */
  function registerNamespace(bytes16 namespace) external;

  /**
   * Register a table with given schema in the given namespace
   */
  function registerTable(
    bytes16 namespace,
    bytes16 file,
    Schema keySchema,
    Schema valueSchema
  ) external returns (bytes32 resourceSelector);

  /**
   * Register metadata (tableName, fieldNames) for the table at the given namespace and file.
   * Requires the caller to own the namespace.
   */
  function setMetadata(
    bytes16 namespace,
    bytes16 file,
    string calldata tableName,
    string[] calldata fieldNames
  ) external;

  /**
   * Register the given store hook for the table at the given namespace and file.
   * Hooks on table files must implement the IStoreHook interface,
   * and hooks on system files must implement the ISystemHook interface.
   */
  function registerHook(bytes16 namespace, bytes16 file, address hook) external;

  /**
   * Register a hook for the table at the given namepace and file.
   * Requires the caller to own the namespace.
   */
  function registerTableHook(bytes16 namespace, bytes16 file, IStoreHook hook) external;

  /**
   * Register a hook for the system at the given namespace and file
   */
  function registerSystemHook(bytes16 namespace, bytes16 file, ISystemHook hook) external;

  /**
   * Register the given system in the given namespace.
   * If the namespace doesn't exist yet, it is registered.
   * The system is granted access to its namespace, so it can write to any table in the same namespace.
   * If publicAccess is true, no access control check is performed for calling the system.
   */
  function registerSystem(
    bytes16 namespace,
    bytes16 file,
    System system,
    bool publicAccess
  ) external returns (bytes32 resourceSelector);

  /**
   * Register a World function selector for the given namespace, file and system function.
   */
  function registerFunctionSelector(
    bytes16 namespace,
    bytes16 file,
    string memory functionName,
    string memory functionArguments
  ) external returns (bytes4 functionSelector);

  /**
   * Register a root World function selector (without namespace / file prefix).
   */
  function registerRootFunctionSelector(
    bytes16 namespace,
    bytes16 file,
    bytes4 worldFunctionSelector,
    bytes4 systemFunctionSelector
  ) external returns (bytes4 functionSelector);
}
