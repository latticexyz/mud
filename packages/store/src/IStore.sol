// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IErrors } from "./IErrors.sol";
import { Schema } from "./Schema.sol";

interface IStore is IErrors {
  event StoreSetRecord(uint256 table, bytes32[] key, bytes data);
  event StoreSetField(uint256 table, bytes32[] key, uint8 schemaIndex, bytes data);
  event StoreDeleteRecord(uint256 table, bytes32[] key);

  function registerSchema(uint256 table, Schema schema, Schema keySchema) external;

  function getSchema(uint256 table) external view returns (Schema schema);

  function getKeySchema(uint256 table) external view returns (Schema schema);

  function setMetadata(uint256 table, string calldata tableName, string[] calldata fieldNames) external;

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(uint256 table, IStoreHook hook) external;

  // Set full record (including full dynamic data)
  function setRecord(uint256 table, bytes32[] calldata key, bytes calldata data) external;

  // Set partial data at schema index
  function setField(uint256 table, bytes32[] calldata key, uint8 schemaIndex, bytes calldata data) external;

  // Push encoded items to the dynamic field at schema index
  function pushToField(uint256 table, bytes32[] calldata key, uint8 schemaIndex, bytes calldata dataToPush) external;

  // Set full record (including full dynamic data)
  function deleteRecord(uint256 table, bytes32[] memory key) external;

  // Get full record (including full array, load table schema from storage)
  function getRecord(uint256 table, bytes32[] memory key) external view returns (bytes memory data);

  // Get full record (including full array)
  function getRecord(uint256 table, bytes32[] calldata key, Schema schema) external view returns (bytes memory data);

  // Get partial data at schema index
  function getField(uint256 table, bytes32[] calldata key, uint8 schemaIndex) external view returns (bytes memory data);

  // If this function exists on the contract, it is a store
  // TODO: benchmark this vs. using a known storage slot to determine whether a contract is a Store
  // (see https://github.com/latticexyz/mud/issues/444)
  function isStore() external view;
}

interface IStoreHook {
  function onSetRecord(uint256 table, bytes32[] memory key, bytes memory data) external;

  // Split onSetField into pre and post to simplify the implementation of hooks
  function onBeforeSetField(uint256 table, bytes32[] memory key, uint8 schemaIndex, bytes memory data) external;

  function onAfterSetField(uint256 table, bytes32[] memory key, uint8 schemaIndex, bytes memory data) external;

  function onDeleteRecord(uint256 table, bytes32[] memory key) external;
}
