// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreErrors } from "./IStoreErrors.sol";
import { Schema } from "./Schema.sol";
import { IStoreHook } from "./IStoreHook.sol";

interface IStoreRead {
  function getValueSchema(bytes32 table) external view returns (Schema schema);

  function getKeySchema(bytes32 table) external view returns (Schema schema);

  // Get full record (including full array)
  function getRecord(
    bytes32 table,
    bytes32[] calldata key,
    Schema valueSchema
  ) external view returns (bytes memory data);

  // Get partial data at schema index
  function getField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    Schema valueSchema
  ) external view returns (bytes memory data);

  // Get field length at schema index
  function getFieldLength(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    Schema valueSchema
  ) external view returns (uint256);

  // Get start:end slice of the field at schema index
  function getFieldSlice(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    Schema valueSchema,
    uint256 start,
    uint256 end
  ) external view returns (bytes memory data);
}

interface IStoreWrite {
  event StoreSetRecord(bytes32 table, bytes32[] key, bytes data);
  event StoreSetField(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data);
  event StoreDeleteRecord(bytes32 table, bytes32[] key);

  // Set full record (including full dynamic data)
  function setRecord(bytes32 table, bytes32[] calldata key, bytes calldata data, Schema valueSchema) external;

  // Set partial data at schema index
  function setField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data,
    Schema valueSchema
  ) external;

  // Push encoded items to the dynamic field at schema index
  function pushToField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush,
    Schema valueSchema
  ) external;

  // Pop byte length from the dynamic field at schema index
  function popFromField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 byteLengthToPop,
    Schema valueSchema
  ) external;

  // Change encoded items within the dynamic field at schema index
  function updateInField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet,
    Schema valueSchema
  ) external;

  // Set full record (including full dynamic data)
  function deleteRecord(bytes32 table, bytes32[] memory key, Schema valueSchema) external;
}

interface IStoreEphemeral {
  event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes data);

  // Emit the ephemeral event without modifying storage
  function emitEphemeralRecord(bytes32 table, bytes32[] calldata key, bytes calldata data, Schema valueSchema) external;
}

/**
 * The IStoreData interface includes methods for reading and writing table values.
 * These methods are frequently invoked during runtime, so it is essential to prioritize
 * optimizing their gas cost
 */
interface IStoreData is IStoreRead, IStoreWrite {

}

/**
 * The IStoreRegistration interface includes methods for managing table schemas,
 * metadata, and hooks, which are usually called once in the setup phase of an application,
 * making them less performance critical than the IStoreData methods.
 */
interface IStoreRegistration {
  function registerTable(
    bytes32 table,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) external;

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(bytes32 table, IStoreHook hookAddress, uint8 enabledHooksBitmap) external;

  // Unregister a hook for the given tableId
  function unregisterStoreHook(bytes32 table, IStoreHook hookAddress) external;
}

interface IStore is IStoreData, IStoreRegistration, IStoreEphemeral, IStoreErrors {}
