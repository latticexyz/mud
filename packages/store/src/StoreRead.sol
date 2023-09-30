// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { STORE_VERSION } from "./version.sol";
import { IStoreRead } from "./IStoreRead.sol";
import { StoreCore } from "./StoreCore.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { Schema } from "./Schema.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { ResourceId } from "./ResourceId.sol";

/**
 * @title StoreRead
 * @dev A contract that provides read operations for storage tables using `StoreCore`.
 */
contract StoreRead is IStoreRead {
  /**
   * @notice Fetches the field layout for a given table.
   * @param tableId The ID of the table for which to retrieve the field layout.
   * @return fieldLayout The layout of fields in the specified table.
   */
  function getFieldLayout(ResourceId tableId) public view virtual returns (FieldLayout fieldLayout) {
    fieldLayout = StoreCore.getFieldLayout(tableId);
  }

  /**
   * @notice Retrieves the value schema for a given table.
   * @param tableId The ID of the table.
   * @return valueSchema The schema for values in the specified table.
   */
  function getValueSchema(ResourceId tableId) public view virtual returns (Schema valueSchema) {
    valueSchema = StoreCore.getValueSchema(tableId);
  }

  /**
   * @notice Retrieves the key schema for a given table.
   * @param tableId The ID of the table.
   * @return keySchema The schema for keys in the specified table.
   */
  function getKeySchema(ResourceId tableId) public view virtual returns (Schema keySchema) {
    keySchema = StoreCore.getKeySchema(tableId);
  }

  /**
   * @notice Fetches a record from a specified table using a provided key tuple.
   * @param tableId The ID of the table.
   * @param keyTuple The tuple used as a key to fetch the record.
   * @return staticData The static data of the record.
   * @return encodedLengths Encoded lengths of dynamic data.
   * @return dynamicData The dynamic data of the record.
   */
  function getRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple
  ) public view virtual returns (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) {
    return StoreCore.getRecord(tableId, keyTuple);
  }

  /**
   * @notice Fetches a record from a specified table using a provided key tuple and field layout.
   * @param tableId The ID of the table.
   * @param keyTuple The tuple used as a key to fetch the record.
   * @param fieldLayout The layout of fields to retrieve.
   * @return staticData The static data of the record.
   * @return encodedLengths Encoded lengths of dynamic data.
   * @return dynamicData The dynamic data of the record.
   */
  function getRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) {
    return StoreCore.getRecord(tableId, keyTuple, fieldLayout);
  }

  /**
   * @notice Retrieves data for a specified field in a record.
   * @dev This overload loads the FieldLayout from storage. If the table's FieldLayout is known
   * to the caller, it should be passed in to the other overload to avoid the storage read.
   * @param tableId The ID of the table.
   * @param keyTuple The tuple used as a key to fetch the field.
   * @param fieldIndex Index of the field to retrieve.
   * @return data The data of the specified field.
   */
  function getField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getField(tableId, keyTuple, fieldIndex);
  }

  /**
   * @notice Retrieves data for a specified field in a record.
   * @param tableId The ID of the table.
   * @param keyTuple The tuple used as a key to fetch the field.
   * @param fieldIndex Index of the field to retrieve.
   * @param fieldLayout The layout of fields for the retrieval.
   * @return data The data of the specified field.
   */
  function getField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getField(tableId, keyTuple, fieldIndex, fieldLayout);
  }

  /**
   * @notice Retrieves data for a specific static (fixed length) field in a record.
   * @param tableId The ID of the table.
   * @param keyTuple The tuple used as a key to fetch the static field.
   * @param fieldIndex Index of the static field to retrieve.
   * @param fieldLayout The layout of fields for the retrieval.
   * @return data The static data of the specified field.
   */
  function getStaticField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes32 data) {
    data = StoreCore.getStaticField(tableId, keyTuple, fieldIndex, fieldLayout);
  }

  /**
   * @notice Retrieves data for a specific dynamic (variable length) field in a record.
   * @param tableId The ID of the table.
   * @param keyTuple The tuple used as a key to fetch the dynamic field.
   * @param dynamicFieldIndex Index of the dynamic field to retrieve.
   * @return data The dynamic data of the specified field.
   */
  function getDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getDynamicField(tableId, keyTuple, dynamicFieldIndex);
  }

  /**
   * @notice Calculates the length of a specified field in a record.
   * @dev This overload loads the FieldLayout from storage. If the table's FieldLayout is known
   * to the caller, it should be passed in to the other overload to avoid the storage read.
   * @param tableId The ID of the table.
   * @param keyTuple The tuple used as a key.
   * @param fieldIndex Index of the field to measure.
   * @return The length of the specified field.
   */
  function getFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex
  ) public view virtual returns (uint256) {
    return StoreCore.getFieldLength(tableId, keyTuple, fieldIndex);
  }

  /**
   * @notice Calculates the length of a specified field in a record.
   * @param tableId The ID of the table.
   * @param keyTuple The tuple used as a key.
   * @param fieldIndex Index of the field to measure.
   * @param fieldLayout The layout of fields for measurement.
   * @return The length of the specified field.
   */
  function getFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (uint256) {
    return StoreCore.getFieldLength(tableId, keyTuple, fieldIndex, fieldLayout);
  }

  /**
   * @notice Calculates the length of a specified dynamic (variable length) field in a record.
   * @param tableId The ID of the table.
   * @param keyTuple The tuple used as a key.
   * @param dynamicFieldIndex Index of the dynamic field to measure.
   * @return The length of the specified dynamic field.
   */
  function getDynamicFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) public view virtual returns (uint256) {
    return StoreCore.getFieldLength(tableId, keyTuple, dynamicFieldIndex);
  }

  /**
   * @notice Retrieves a slice of a dynamic (variable length) field.
   * @param tableId The ID of the table.
   * @param keyTuple The tuple used as a key to fetch the dynamic field slice.
   * @param dynamicFieldIndex Index of the dynamic field to slice.
   * @param start The starting position of the slice.
   * @param end The ending position of the slice.
   * @return The sliced data from the specified dynamic field.
   */

  function getDynamicFieldSlice(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint256 start,
    uint256 end
  ) public view virtual returns (bytes memory) {
    return StoreCore.getDynamicFieldSlice(tableId, keyTuple, dynamicFieldIndex, start, end);
  }
}
