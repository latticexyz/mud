// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PackedCounter } from "./PackedCounter.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { Schema } from "./Schema.sol";
import { ResourceId } from "./ResourceId.sol";

interface IStoreRead {
  function getFieldLayout(ResourceId tableId) external view returns (FieldLayout fieldLayout);

  function getValueSchema(ResourceId tableId) external view returns (Schema valueSchema);

  function getKeySchema(ResourceId tableId) external view returns (Schema keySchema);

  /**
   * Get full record (all fields, static and dynamic data) for the given tableId and key tuple, loading the field layout from storage
   */
  function getRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple
  ) external view returns (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData);

  /**
   * Get full record (all fields, static and dynamic data) for the given tableId and key tuple, with the given field layout
   */
  function getRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    FieldLayout fieldLayout
  ) external view returns (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData);

  /**
   * Get a single field from the given tableId and key tuple, loading the field layout from storage
   */
  function getField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex
  ) external view returns (bytes memory data);

  /**
   * Get a single field from the given tableId and key tuple, with the given field layout
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
   * Get the byte length of a single field from the given tableId and key tuple, loading the field layout from storage
   */
  function getFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex
  ) external view returns (uint256);

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
   * Get the byte length of a single dynamic field from the given tableId and key tuple
   */
  function getDynamicFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) external view returns (uint256);

  /**
   * Get a byte slice (including start, excluding end) of a single dynamic field from the given tableId and key tuple, with the given value field layout.
   * The slice is unchecked and will return invalid data if `start`:`end` overflow.
   */
  function getDynamicFieldSlice(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint256 start,
    uint256 end
  ) external view returns (bytes memory data);
}
