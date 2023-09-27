// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "./ResourceId.sol";
import { PackedCounter } from "./PackedCounter.sol";

interface IStoreEvents {
  /**
   * @notice Emitted when a new record is set in the store.
   * @param tableId The ID of the table where the record is set.
   * @param keyTuple An array representing the composite key for the record.
   * @param staticData The static data of the record.
   * @param encodedLengths The encoded lengths of the dynamic data of the record.
   * @param dynamicData The dynamic data of the record.
   */
  event Store_SetRecord(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    bytes staticData,
    PackedCounter encodedLengths,
    bytes dynamicData
  );

  /**
   * @notice Emitted when static data in the store is spliced.
   * @dev In static data, data is always overwritten starting at the start position,
   * so the total length of the data remains the same and no data is shifted.
   * @param tableId The ID of the table where the data is spliced.
   * @param keyTuple An array representing the key for the record.
   * @param start The start position in bytes for the splice operation.
   * @param data The data to write to the static data of the record at the start byte.
   */
  event Store_SpliceStaticData(ResourceId indexed tableId, bytes32[] keyTuple, uint48 start, bytes data);

  /**
   * @notice Emitted when dynamic data in the store is spliced.
   * @param tableId The ID of the table where the data is spliced.
   * @param keyTuple An array representing the composite key for the record.
   * @param start The start position in bytes for the splice operation.
   * @param deleteCount The number of bytes to delete in the splice operation.
   * @param encodedLengths The encoded lengths of the dynamic data of the record.
   * @param data The data to insert into the dynamic data of the record at the start byte.
   */
  event Store_SpliceDynamicData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    PackedCounter encodedLengths,
    bytes data
  );

  /**
   * @notice Emitted when a record is deleted from the store.
   * @param tableId The ID of the table where the record is deleted.
   * @param keyTuple An array representing the composite key for the record.
   */
  event Store_DeleteRecord(ResourceId indexed tableId, bytes32[] keyTuple);
}
