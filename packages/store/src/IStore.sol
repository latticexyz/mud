// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreErrors } from "./IStoreErrors.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { Schema } from "./Schema.sol";
import { IStoreHook } from "./IStoreHook.sol";

interface IStoreRead {
  function getFieldLayout(bytes32 table) external view returns (FieldLayout fieldLayout);

  function getValueSchema(bytes32 table) external view returns (Schema schema);

  function getKeySchema(bytes32 table) external view returns (Schema schema);

  // Get full record (including full array)
  function getRecord(
    bytes32 table,
    bytes32[] calldata key,
    FieldLayout fieldLayout
  ) external view returns (bytes memory data);

  // Get partial data at schema index
  function getField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) external view returns (bytes memory data);

  function loadStaticField(uint256 storagePointer, uint256 length, uint256 offset) external view returns (bytes32);

  function loadDynamicField(
    uint256 storagePointer,
    uint256 lengthStoragePointer,
    uint8 dynamicSchemaIndex
  ) external view returns (bytes memory);

  // Get field length at schema index
  function getFieldLength(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) external view returns (uint256);

  function loadFieldLength(uint256 lengthStoragePointer, uint8 dynamicSchemaIndex) external view returns (uint256);

  // Get start:end slice of the field at schema index
  function getFieldSlice(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    FieldLayout fieldLayout,
    uint256 start,
    uint256 end
  ) external view returns (bytes memory data);

  function loadFieldSlice(uint256 storagePointer, uint256 start, uint256 end) external view returns (bytes memory data);
}

interface IStoreWrite {
  event StoreSetRecord(bytes32 table, bytes32[] key, bytes data);
  event StoreSetField(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data);
  event StoreDeleteRecord(bytes32 table, bytes32[] key);

  // Set full record (including full dynamic data)
  function setRecord(bytes32 table, bytes32[] calldata key, bytes calldata data, FieldLayout fieldLayout) external;

  // Set partial data at schema index
  function setField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) external;

  function storeStaticField(
    uint256 storagePointer,
    uint256 length,
    uint256 offset,
    bytes memory data,
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) external;

  // Push encoded items to the dynamic field at schema index
  function pushToField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush,
    FieldLayout fieldLayout
  ) external;

  // Pop byte length from the dynamic field at schema index
  function popFromField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 byteLengthToPop,
    FieldLayout fieldLayout
  ) external;

  // Change encoded items within the dynamic field at schema index
  function updateInField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet,
    FieldLayout fieldLayout
  ) external;

  // Set full record (including full dynamic data)
  function deleteRecord(bytes32 table, bytes32[] memory key, FieldLayout fieldLayout) external;
}

interface IStoreEphemeral {
  event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes data);

  // Emit the ephemeral event without modifying storage
  function emitEphemeralRecord(
    bytes32 table,
    bytes32[] calldata key,
    bytes calldata data,
    FieldLayout fieldLayout
  ) external;
}

/**
 * The IStoreData interface includes methods for reading and writing table values.
 * These methods are frequently invoked during runtime, so it is essential to prioritize
 * optimizing their gas cost
 */
interface IStoreData is IStoreRead, IStoreWrite {

}

/**
 * The IStoreRegistration interface includes methods for managing table field layouts,
 * metadata, and hooks, which are usually called once in the setup phase of an application,
 * making them less performance critical than the IStoreData methods.
 */
interface IStoreRegistration {
  function registerTable(
    bytes32 table,
    FieldLayout fieldLayout,
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
