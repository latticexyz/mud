// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";
import { Schema } from "./Schema.sol";

interface IStore {
  event MudStoreSetRecord(bytes32 table, bytes32[] key, bytes data);
  event MudStoreSetField(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data);
  event MudStoreDeleteRecord(bytes32 table, bytes32[] key);

  function registerSchema(bytes32 table, Schema schema) external;

  function getSchema(bytes32 table) external view returns (Schema schema);

  // Set full record (including full dynamic data)
  function setRecord(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) external;

  // Set partial data at schema index
  function setField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data
  ) external;

  // Register hooks to be called when a record or field is set or deleted
  function registerHooks(bytes32 table, IStoreHook hooks) external;

  // Set full record (including full dynamic data)
  function deleteRecord(bytes32 table, bytes32[] memory key) external;

  // Get full record (including full array, load table schema from storage)
  function getRecord(bytes32 table, bytes32[] memory key) external view returns (bytes memory data);

  // Get full record (including full array)
  function getRecord(
    bytes32 table,
    bytes32[] memory key,
    Schema schema
  ) external view returns (bytes memory data);

  // Get partial data at schema index
  function getField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex
  ) external view returns (bytes memory data);

  // If this function exists on the contract, it is a store
  // TODO: benchmark this vs. using a known storage slot to determine whether a contract is a Store
  function isStore() external view;
}

interface IStoreHook {
  function onSetRecord(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) external;

  function onSetField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data
  ) external;

  function onDeleteRecord(bytes32 table, bytes32[] memory key) external;
}
