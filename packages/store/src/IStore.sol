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

  // Get field length at schema index
  function getFieldLength(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) external view returns (uint256);

  // Get start:end slice of the field at schema index
  function getFieldSlice(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    FieldLayout fieldLayout,
    uint256 start,
    uint256 end
  ) external view returns (bytes memory data);
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

  // Delete full record
  function deleteRecord(bytes32 table, bytes32[] memory key, FieldLayout fieldLayout) external;
}

interface IStoreOffchain {
  // Emit StoreSetRecord without modifying storage
  function emitSetRecord(
    bytes32 table,
    bytes32[] calldata keyTuple,
    bytes calldata data,
    FieldLayout fieldLayout
  ) external;

  // Emit StoreDeleteRecord without modifying storage
  function emitDeleteRecord(bytes32 table, bytes32[] calldata keyTuple) external;
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
    bool offchainOnly,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) external;

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(bytes32 table, IStoreHook hookAddress, uint8 enabledHooksBitmap) external;

  // Unregister a hook for the given tableId
  function unregisterStoreHook(bytes32 table, IStoreHook hookAddress) external;
}

interface IStore is IStoreData, IStoreRegistration, IStoreOffchain, IStoreErrors {}
