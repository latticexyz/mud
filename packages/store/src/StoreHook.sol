// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IStoreHook, STORE_HOOK_INTERFACE_ID } from "./IStoreHook.sol";
import { ERC165_INTERFACE_ID } from "./IERC165.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { ResourceId } from "./ResourceId.sol";

/**
 * @title Store Hook Contract
 * @notice This abstract contract provides hooks for the storage operations.
 * @dev Implementers should override the hook functions to provide custom logic.
 * If any hooks are activated without overriding these functions, they revert.
 */
abstract contract StoreHook is IStoreHook {
  /**
   * @notice Check if the interface is supported.
   * @dev This function is a part of the ERC-165 standard.
   * @param interfaceId The ID of the interface to check.
   * @return true if the interface is supported, false otherwise.
   */
  function supportsInterface(bytes4 interfaceId) public pure virtual returns (bool) {
    return interfaceId == STORE_HOOK_INTERFACE_ID || interfaceId == ERC165_INTERFACE_ID;
  }

  /**
   * @notice Hook that runs before setting a record.
   * @dev This function should be overridden to provide custom logic.
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
  ) public virtual {
    revert StoreHook_NotImplemented();
  }

  /**
   * @notice Hook that runs after setting a record.
   * @dev This function should be overridden to provide custom logic.
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
  ) public virtual {
    revert StoreHook_NotImplemented();
  }

  /**
   * @notice Hook that runs before splicing static (fixed length) data.
   * @dev This function should be overridden to provide custom logic.
   * Splice operations in static data always overwrite data starting at
   * the start position,
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
  ) public virtual {
    revert StoreHook_NotImplemented();
  }

  /**
   * @notice Hook that runs after splicing static (fixed length) data.
   * @dev This function should be overridden to provide custom logic.
   * Splice operations in static data always overwrite data starting at
   * the start position,
   * so the total length of the data remains the same and no data is shifted.
   * @param tableId The ID of the table where the data is to be spliced.
   * @param keyTuple An array representing the composite key for the record.
   * @param start The start byte position for splicing.
   * @param data The data to be written to the static data of the record at the start byte.
   */
  function onAfterSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) public virtual {
    revert StoreHook_NotImplemented();
  }

  /**
   * @notice Hook that runs before splicing dynamic (variable length) data.
   * @dev This function should be overridden to provide custom logic.
   * Splice operations in dynamic data always reach the end of the dynamic data
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
  ) public virtual {
    revert StoreHook_NotImplemented();
  }

  /**
   * @notice Hook that runs after splicing dynamic (variable length) data.
   * @dev This function should be overridden to provide custom logic.
   * Splice operations in dynamic data always reach the end of the dynamic data
   * to avoid shifting data after the inserted or deleted data.
   * @param tableId The ID of the table where the data is to be spliced.
   * @param keyTuple An array representing the composite key for the record.
   * @param dynamicFieldIndex The index of the dynamic field.
   * @param startWithinField The start byte position within the field for splicing.
   * @param deleteCount The number of bytes to delete in the dynamic data of the record.
   * @param encodedLengths The encoded lengths of the dynamic data of the record.
   * @param data The data to be inserted into the dynamic data of the record at the start byte.
   */
  function onAfterSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    PackedCounter encodedLengths,
    bytes memory data
  ) public virtual {
    revert StoreHook_NotImplemented();
  }

  /**
   * @notice Hook that runs before deleting a record.
   * @dev This function should be overridden to provide custom logic.
   * @param tableId The ID of the table where the record is to be deleted.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldLayout The layout of the field, see FieldLayout.sol.
   */
  function onBeforeDeleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) public virtual {
    revert StoreHook_NotImplemented();
  }

  /**
   * @notice Hook that runs after deleting a record.
   * @dev This function should be overridden to provide custom logic.
   * @param tableId The ID of the table where the record is to be deleted.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldLayout The layout of the field, see FieldLayout.sol.
   */
  function onAfterDeleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) public virtual {
    revert StoreHook_NotImplemented();
  }
}
