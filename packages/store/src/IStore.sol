// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IErrors } from "./IErrors.sol";
import { Schema } from "./Schema.sol";

// hot code paths (need gas optimizations)
interface IStoreData is IErrors {
  event StoreSetRecord(bytes32 table, bytes32[] key, bytes data);
  event StoreSetField(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data);
  event StoreDeleteRecord(bytes32 table, bytes32[] key);

  function getSchema(bytes32 table) external view returns (Schema schema);

  function getKeySchema(bytes32 table) external view returns (Schema schema);

  // Set full record (including full dynamic data)
  function setRecord(bytes32 table, bytes32[] calldata key, bytes calldata data) external;

  // Set partial data at schema index
  function setField(bytes32 table, bytes32[] calldata key, uint8 schemaIndex, bytes calldata data) external;

  // Push encoded items to the dynamic field at schema index
  function pushToField(bytes32 table, bytes32[] calldata key, uint8 schemaIndex, bytes calldata dataToPush) external;

  // Change encoded items within the dynamic field at schema index
  function updateInField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet
  ) external;

  // Set full record (including full dynamic data)
  function deleteRecord(bytes32 table, bytes32[] memory key) external;

  // Get full record (including full array, load table schema from storage)
  function getRecord(bytes32 table, bytes32[] memory key) external view returns (bytes memory data);

  // Get full record (including full array)
  function getRecord(bytes32 table, bytes32[] calldata key, Schema schema) external view returns (bytes memory data);

  // Get partial data at schema index
  function getField(bytes32 table, bytes32[] calldata key, uint8 schemaIndex) external view returns (bytes memory data);

  // If this function exists on the contract, it is a store
  // TODO: benchmark this vs. using a known storage slot to determine whether a contract is a Store
  // (see https://github.com/latticexyz/mud/issues/444)
  function isStore() external view;
}

/**
* The IStoreRegistration interface includes methods for managing table schemas,
* metadata, and hooks, which are usually called once in the setup phase of an application,
* making them less performance critical than the IStoreData methods.
*/
interface IStoreRegistration {
  function registerSchema(bytes32 table, Schema schema, Schema keySchema) external;

  function setMetadata(bytes32 table, string calldata tableName, string[] calldata fieldNames) external;

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(bytes32 table, IStoreHook hook) external;
}

interface IStore is IStoreData, IStoreRegistration {}

interface IStoreHook {
  function onSetRecord(bytes32 table, bytes32[] memory key, bytes memory data) external;

  // Split onSetField into pre and post to simplify the implementation of hooks
  function onBeforeSetField(bytes32 table, bytes32[] memory key, uint8 schemaIndex, bytes memory data) external;

  function onAfterSetField(bytes32 table, bytes32[] memory key, uint8 schemaIndex, bytes memory data) external;

  function onDeleteRecord(bytes32 table, bytes32[] memory key) external;
}
