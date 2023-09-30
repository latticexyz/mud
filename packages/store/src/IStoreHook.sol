// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FieldLayout } from "./FieldLayout.sol";
import { IERC165, ERC165_INTERFACE_ID } from "./IERC165.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { ResourceId } from "./ResourceId.sol";

// ERC-165 Interface ID (see https://eips.ethereum.org/EIPS/eip-165)
bytes4 constant STORE_HOOK_INTERFACE_ID = IStoreHook.onBeforeSetRecord.selector ^
  IStoreHook.onAfterSetRecord.selector ^
  IStoreHook.onBeforeSpliceStaticData.selector ^
  IStoreHook.onAfterSpliceStaticData.selector ^
  IStoreHook.onBeforeSpliceDynamicData.selector ^
  IStoreHook.onAfterSpliceDynamicData.selector ^
  IStoreHook.onBeforeDeleteRecord.selector ^
  IStoreHook.onAfterDeleteRecord.selector ^
  ERC165_INTERFACE_ID;

interface IStoreHook is IERC165 {
  /// @notice Error emitted when a function is not implemented.
  error StoreHook_NotImplemented();

  /**
   * @notice Called before setting a record in the store.
   * @param tableId The ID of the table where the record is to be set.
   * @param keyTuple An array representing the composite key for the record.
   * @param staticData The static data of the record.
   * @param encodedLengths The encoded lengths of the dynamic data of the record.
   * @param dynamicData The dynamic data of the record.
   * @param fieldLayout The layout of the field, see FieldLayout.sol.
   */
  function onBeforeSetRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) external;

  /**
   * @notice Called after setting a record in the store.
   * @param tableId The ID of the table where the record was set.
   * @param keyTuple An array representing the composite key for the record.
   * @param staticData The static data of the record.
   * @param encodedLengths The encoded lengths of the dynamic data of the record.
   * @param dynamicData The dynamic data of the record.
   * @param fieldLayout The layout of the field, see FieldLayout.sol.
   */
  function onAfterSetRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) external;

  /**
   * @notice Called before splicing static data in the store.
   * @dev Splice operations in static data always overwrite data starting at the start position,
   * so the total length of the data remains the same and no data is shifted.
   * @param tableId The ID of the table where the data is to be spliced.
   * @param keyTuple An array representing the composite key for the record.
   * @param start The start byte position for splicing.
   * @param data The data to be written to the static data of the record at the start byte.
   */
  function onBeforeSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) external;

  /**
   * @notice Called after splicing static data in the store.
   * @dev Splice operations in static data always overwrite data starting at the start position,
   * so the total length of the data remains the same and no data is shifted.
   * @param tableId The ID of the table where the data was spliced.
   * @param keyTuple An array representing the composite key for the record.
   * @param start The start byte position for splicing.
   * @param data The data written to the static data of the record at the start byte.
   */
  function onAfterSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) external;

  /**
   * @notice Called before splicing dynamic data in the store.
   * @dev Splice operations in dynamic data always reach the end of the dynamic data
   * to avoid shifting data after the inserted or deleted data.
   * @param tableId The ID of the table where the data is to be spliced.
   * @param keyTuple An array representing the composite key for the record.
   * @param dynamicFieldIndex The index of the dynamic field.
   * @param startWithinField The start byte position within the field for splicing.
   * @param deleteCount The number of bytes to delete in the dynamic data of the record.
   * @param encodedLengths The encoded lengths of the dynamic data of the record.
   * @param data The data to be inserted into the dynamic data of the record at the start byte.
   */
  function onBeforeSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    PackedCounter encodedLengths,
    bytes memory data
  ) external;

  /**
   * @notice Called after splicing dynamic data in the store.
   * @dev Splice operations in dynamic data always reach the end of the dynamic data
   * to avoid shifting data after the inserted or deleted data.
   * @param tableId The ID of the table where the data was spliced.
   * @param keyTuple An array representing the composite key for the record.
   * @param dynamicFieldIndex The index of the dynamic field.
   * @param startWithinField The start byte position within the field for splicing.
   * @param deleteCount The number of bytes deleted in the dynamic data of the record.
   * @param encodedLengths The encoded lengths of the dynamic data of the record.
   * @param data The data inserted into the dynamic data of the record at the start byte.
   */
  function onAfterSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    PackedCounter encodedLengths,
    bytes memory data
  ) external;

  /**
   * @notice Called before deleting a record from the store.
   * @param tableId The ID of the table where the record is to be deleted.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldLayout The layout of the field, see FieldLayout.sol.
   */
  function onBeforeDeleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) external;

  /**
   * @notice Called after deleting a record from the store.
   * @param tableId The ID of the table where the record was deleted.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldLayout The layout of the field, see FieldLayout.sol.
   */
  function onAfterDeleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) external;
}
