// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreErrors } from "./IStoreErrors.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { Schema } from "./Schema.sol";
import { IStoreHook } from "./IStoreHook.sol";
import { ResourceId } from "./ResourceId.sol";

interface IStoreRead {
  event HelloStore(bytes32 indexed storeVersion);

  function storeVersion() external view returns (bytes32);

  function getFieldLayout(ResourceId tableId) external view returns (FieldLayout fieldLayout);

  function getValueSchema(ResourceId tableId) external view returns (Schema valueSchema);

  function getKeySchema(ResourceId tableId) external view returns (Schema keySchema);

  /**
   * Get full record (all fields, static and dynamic data) for the given tableId and key tuple, with the given value field layout
   */
  function getRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    FieldLayout fieldLayout
  ) external view returns (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData);

  /**
   * Get a single field from the given tableId and key tuple, with the given value field layout
   */
  function getField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) external view returns (bytes memory data);

  /**
   * Get a single static field from the given tableId and key tuple, with the given value field layout.
   * Note: the field value is left-aligned in the returned bytes32, the rest of the word is not zeroed out.
   * Consumers are expected to truncate the returned value as needed.
   */
  function getStaticField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) external view returns (bytes32);

  /**
   * Get a single dynamic field from the given tableId and key tuple at the given dynamic field index.
   * (Dynamic field index = field index - number of static fields)
   */
  function getDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) external view returns (bytes memory);

  /**
   * Get the byte length of a single field from the given tableId and key tuple, with the given value field layout
   */
  function getFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) external view returns (uint256);

  /**
   * Get a byte slice (including start, excluding end) of a single dynamic field from the given tableId and key tuple, with the given value field layout.
   * The slice is unchecked and will return invalid data if `start`:`end` overflow.
   */
  function getFieldSlice(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout,
    uint256 start,
    uint256 end
  ) external view returns (bytes memory data);
}

interface IStoreWrite {
  event StoreSetRecord(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    bytes staticData,
    bytes32 encodedLengths,
    bytes dynamicData
  );
  event StoreSpliceStaticData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes data
  );
  event StoreSpliceDynamicData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes data,
    bytes32 encodedLengths
  );
  event StoreDeleteRecord(ResourceId indexed tableId, bytes32[] keyTuple);

  // Set full record (including full dynamic data)
  function setRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    bytes calldata staticData,
    PackedCounter encodedLengths,
    bytes calldata dynamicData,
    FieldLayout fieldLayout
  ) external;

  // Splice data in the static part of the record
  function spliceStaticData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes calldata data
  ) external;

  // Splice data in the dynamic part of the record
  function spliceDynamicData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes calldata data
  ) external;

  // Set partial data at field index
  function setField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) external;

  // Push encoded items to the dynamic field at field index
  function pushToField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata dataToPush,
    FieldLayout fieldLayout
  ) external;

  // Pop byte length from the dynamic field at field index
  function popFromField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    uint256 byteLengthToPop,
    FieldLayout fieldLayout
  ) external;

  // Change encoded items within the dynamic field at field index
  function updateInField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet,
    FieldLayout fieldLayout
  ) external;

  // Set full record (including full dynamic data)
  function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) external;
}

interface IStoreEphemeral {
  event StoreEphemeralRecord(
    ResourceId tableId,
    bytes32[] keyTuple,
    bytes staticData,
    bytes32 encodedLengths,
    bytes dynamicData
  );

  // Emit the ephemeral event without modifying storage
  function emitEphemeralRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    bytes calldata staticData,
    PackedCounter encodedLengths,
    bytes calldata dynamicData,
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
    ResourceId tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) external;

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(ResourceId tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) external;

  // Unregister a hook for the given tableId
  function unregisterStoreHook(ResourceId tableId, IStoreHook hookAddress) external;
}

interface IStore is IStoreData, IStoreRegistration, IStoreEphemeral, IStoreErrors {}
