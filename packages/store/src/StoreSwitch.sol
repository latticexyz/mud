// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IStore } from "./IStore.sol";
import { PackedCounter } from "../src/PackedCounter.sol";
import { IStoreHook } from "./IStoreHook.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { ResourceId } from "./ResourceId.sol";

/**
 * @title StoreSwitch Library
 * @notice This library serves as an interface switch to interact with the store,
 *         either by directing calls to itself or to a designated external store.
 * @dev The primary purpose is to abstract the storage details, such that the
 *      calling function doesn't need to know if it's interacting with its own
 *      storage or with an external contract's storage.
 */
library StoreSwitch {
  /// @dev Internal constant representing the storage slot used by the library.
  bytes32 private constant STORAGE_SLOT = keccak256("mud.store.storage.StoreSwitch");

  /**
   * @dev Represents the layout of the storage slot (currently just the address)
   */
  struct StorageSlotLayout {
    address storeAddress; // Address of the external store (or self).
  }

  /**
   * @notice Gets the storage layout.
   * @return layout The current storage layout.
   */
  function _layout() private pure returns (StorageSlotLayout storage layout) {
    bytes32 slot = STORAGE_SLOT;
    assembly {
      layout.slot := slot
    }
  }

  /**
   * @notice Fetch the store address to be used for data operations.
   * If _storeAddress is zero, it means that it's uninitialized and
   * therefore it's the default (msg.sender).
   * @return Address of the store, or `msg.sender` if uninitialized.
   */
  function getStoreAddress() internal view returns (address) {
    address _storeAddress = _layout().storeAddress;
    if (_storeAddress == address(0)) {
      return msg.sender;
    } else {
      return _storeAddress;
    }
  }

  /**
   * @notice Set the store address for subsequent operations.
   * @dev If it stays uninitialized, StoreSwitch falls back to calling store methods on msg.sender.
   * @param _storeAddress The address of the external store contract.
   */
  function setStoreAddress(address _storeAddress) internal {
    _layout().storeAddress = _storeAddress;
  }

  /**
   * @notice Register a store hook for a particular table.
   * @param tableId Unique identifier of the table.
   * @param hookAddress Address of the hook contract.
   * @param enabledHooksBitmap Bitmap representing the hooks which this contract overrides.
   */
  function registerStoreHook(ResourceId tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerStoreHook(tableId, hookAddress, enabledHooksBitmap);
    } else {
      IStore(_storeAddress).registerStoreHook(tableId, hookAddress, enabledHooksBitmap);
    }
  }

  /**
   * @notice Unregister a previously registered store hook.
   * @param tableId Unique identifier of the table.
   * @param hookAddress Address of the hook contract to be unregistered.
   */
  function unregisterStoreHook(ResourceId tableId, IStoreHook hookAddress) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.unregisterStoreHook(tableId, hookAddress);
    } else {
      IStore(_storeAddress).unregisterStoreHook(tableId, hookAddress);
    }
  }

  /**
   * @dev Fetches the field layout for a specified table.
   * @param tableId The ID of the table for which to retrieve the field layout.
   * @return fieldLayout The layout of the fields in the specified table.
   */
  function getFieldLayout(ResourceId tableId) internal view returns (FieldLayout fieldLayout) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      fieldLayout = StoreCore.getFieldLayout(tableId);
    } else {
      fieldLayout = IStore(_storeAddress).getFieldLayout(tableId);
    }
  }

  /**
   * @dev Retrieves the value schema for a specified table.
   * @param tableId The ID of the table for which to retrieve the value schema.
   * @return valueSchema The schema for values in the specified table.
   */
  function getValueSchema(ResourceId tableId) internal view returns (Schema valueSchema) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      valueSchema = StoreCore.getValueSchema(tableId);
    } else {
      valueSchema = IStore(_storeAddress).getValueSchema(tableId);
    }
  }

  /**
   * @dev Retrieves the key schema for a specified table.
   * @param tableId The ID of the table for which to retrieve the key schema.
   * @return keySchema The schema for keys in the specified table.
   */
  function getKeySchema(ResourceId tableId) internal view returns (Schema keySchema) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      keySchema = StoreCore.getKeySchema(tableId);
    } else {
      keySchema = IStore(_storeAddress).getKeySchema(tableId);
    }
  }

  /**
   * @dev Registers a table with specified configurations.
   * @param tableId The ID of the table to register.
   * @param fieldLayout The layout of the fields for the table.
   * @param keySchema The schema for keys in the table.
   * @param valueSchema The schema for values in the table.
   * @param keyNames Names of keys in the table.
   * @param fieldNames Names of fields in the table.
   */
  function registerTable(
    ResourceId tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] memory keyNames,
    string[] memory fieldNames
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
    } else {
      IStore(_storeAddress).registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
    }
  }

  /**
   * @dev Sets a record in the store.
   * @param tableId The table's ID.
   * @param keyTuple Array of key values.
   * @param staticData Fixed-length fields data.
   * @param encodedLengths Encoded lengths for dynamic data.
   * @param dynamicData Dynamic-length fields data.
   */
  function setRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
    } else {
      IStore(_storeAddress).setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
    }
  }

  /**
   * @dev Splices the static (fixed length) data for a given table ID and key tuple, starting at a specific point.
   * @param tableId The ID of the resource table.
   * @param keyTuple An array of bytes32 keys identifying the data record.
   * @param start The position to begin splicing.
   * @param data The data to splice into the record.
   */
  function spliceStaticData(ResourceId tableId, bytes32[] memory keyTuple, uint48 start, bytes memory data) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.spliceStaticData(tableId, keyTuple, start, data);
    } else {
      IStore(_storeAddress).spliceStaticData(tableId, keyTuple, start, data);
    }
  }

  /**
   * @dev Splices the dynamic data for a given table ID, key tuple, and dynamic field index.
   * @param tableId The ID of the resource table.
   * @param keyTuple An array of bytes32 keys identifying the data record.
   * @param dynamicFieldIndex The index of the dynamic field to splice.
   * @param startWithinField The position within the dynamic field to start splicing.
   * @param deleteCount The number of bytes to delete starting from the splice point.
   * @param data The data to splice into the dynamic field.
   */
  function spliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes memory data
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data);
    } else {
      IStore(_storeAddress).spliceDynamicData(
        tableId,
        keyTuple,
        dynamicFieldIndex,
        startWithinField,
        deleteCount,
        data
      );
    }
  }

  /**
   * @dev Sets the data for a specific field in a record identified by table ID and key tuple.
   * @param tableId The ID of the resource table.
   * @param keyTuple An array of bytes32 keys identifying the data record.
   * @param fieldIndex The index of the field to set.
   * @param data The data to set for the field.
   */
  function setField(ResourceId tableId, bytes32[] memory keyTuple, uint8 fieldIndex, bytes memory data) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setField(tableId, keyTuple, fieldIndex, data);
    } else {
      IStore(_storeAddress).setField(tableId, keyTuple, fieldIndex, data);
    }
  }

  /**
   * @dev Sets the data for a specific field in a record, considering a specific field layout.
   * @param tableId The ID of the resource table.
   * @param keyTuple An array of bytes32 keys identifying the data record.
   * @param fieldIndex The index of the field to set.
   * @param data The data to set for the field.
   * @param fieldLayout The layout structure of the field.
   */
  function setField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setField(tableId, keyTuple, fieldIndex, data, fieldLayout);
    } else {
      IStore(_storeAddress).setField(tableId, keyTuple, fieldIndex, data, fieldLayout);
    }
  }

  /**
   * @dev Sets the data for a specific static (fixed length) field in a record, considering a specific field layout.
   * @param tableId The ID of the resource table.
   * @param keyTuple An array of bytes32 keys identifying the data record.
   * @param fieldIndex The index of the field to set.
   * @param data The data to set for the field.
   * @param fieldLayout The layout structure of the field.
   */
  function setStaticField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setStaticField(tableId, keyTuple, fieldIndex, data, fieldLayout);
    } else {
      IStore(_storeAddress).setStaticField(tableId, keyTuple, fieldIndex, data, fieldLayout);
    }
  }

  /**
   * @dev Sets the value of a specific dynamic (variable-length) field in a record.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @param dynamicFieldIndex The index of the dynamic field to set.
   * @param data The data to set for the field.
   */
  function setDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    bytes memory data
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setDynamicField(tableId, keyTuple, dynamicFieldIndex, data);
    } else {
      IStore(_storeAddress).setDynamicField(tableId, keyTuple, dynamicFieldIndex, data);
    }
  }

  /**
   * @dev Appends data to a specific dynamic (variable length) field of a record.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @param dynamicFieldIndex The index of the dynamic field.
   * @param dataToPush The data to append to the field.
   */
  function pushToDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    bytes memory dataToPush
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.pushToDynamicField(tableId, keyTuple, dynamicFieldIndex, dataToPush);
    } else {
      IStore(_storeAddress).pushToDynamicField(tableId, keyTuple, dynamicFieldIndex, dataToPush);
    }
  }

  /**
   * @dev Removes data from the end of a specific dynamic (variable length) field of a record.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @param dynamicFieldIndex The index of the dynamic field.
   * @param byteLengthToPop The number of bytes to remove from the end of the field.
   */
  function popFromDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint256 byteLengthToPop
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.popFromDynamicField(tableId, keyTuple, dynamicFieldIndex, byteLengthToPop);
    } else {
      IStore(_storeAddress).popFromDynamicField(tableId, keyTuple, dynamicFieldIndex, byteLengthToPop);
    }
  }

  /**
   * @dev Deletes a record from a table.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   */
  function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.deleteRecord(tableId, keyTuple);
    } else {
      IStore(_storeAddress).deleteRecord(tableId, keyTuple);
    }
  }

  /**
   * @dev Retrieves a record from a table.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @return staticData The static data of the record.
   * @return encodedLengths Encoded lengths of dynamic data.
   * @return dynamicData The dynamic data of the record.
   */
  function getRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple
  ) internal view returns (bytes memory, PackedCounter, bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getRecord(tableId, keyTuple);
    } else {
      return IStore(_storeAddress).getRecord(tableId, keyTuple);
    }
  }

  /**
   * @dev Retrieves a record from a table with a specific layout.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @param fieldLayout The layout of the fields in the record.
   * @return staticData The static data of the record.
   * @return encodedLengths Encoded lengths of dynamic data.
   * @return dynamicData The dynamic data of the record.
   */
  function getRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory, PackedCounter, bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getRecord(tableId, keyTuple, fieldLayout);
    } else {
      return IStore(_storeAddress).getRecord(tableId, keyTuple, fieldLayout);
    }
  }

  /**
   * @dev Retrieves a specific field from a record.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @param fieldIndex The index of the field to retrieve.
   * @return Returns the data of the specified field.
   */
  function getField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getField(tableId, keyTuple, fieldIndex);
    } else {
      return IStore(_storeAddress).getField(tableId, keyTuple, fieldIndex);
    }
  }

  /**
   * @dev Retrieves a specific field from a record with a given layout.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @param fieldIndex The index of the field to retrieve.
   * @param fieldLayout The layout of the field being retrieved.
   * @return Returns the data of the specified field.
   */
  function getField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getField(tableId, keyTuple, fieldIndex, fieldLayout);
    } else {
      return IStore(_storeAddress).getField(tableId, keyTuple, fieldIndex, fieldLayout);
    }
  }

  /**
   * @dev Retrieves a specific static (fixed length) field from a record with a given layout.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @param fieldIndex The index of the static field to retrieve.
   * @param fieldLayout The layout of the static field being retrieved.
   * @return Returns the data of the specified static field.
   */
  function getStaticField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (bytes32) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getStaticField(tableId, keyTuple, fieldIndex, fieldLayout);
    } else {
      return IStore(_storeAddress).getStaticField(tableId, keyTuple, fieldIndex, fieldLayout);
    }
  }

  /**
   * @dev Retrieves a specific dynamic (variable length) field from a record.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @param dynamicFieldIndex The index of the dynamic field to retrieve.
   * @return Returns the data of the specified dynamic field.
   */
  function getDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getDynamicField(tableId, keyTuple, dynamicFieldIndex);
    } else {
      return IStore(_storeAddress).getDynamicField(tableId, keyTuple, dynamicFieldIndex);
    }
  }

  /**
   * @dev Retrieves the length of a specific field in a record.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @param fieldIndex The index of the field whose length is to be retrieved.
   * @return Returns the length of the specified field.
   */
  function getFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex
  ) internal view returns (uint256) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getFieldLength(tableId, keyTuple, fieldIndex);
    } else {
      return IStore(_storeAddress).getFieldLength(tableId, keyTuple, fieldIndex);
    }
  }

  /**
   * @dev Retrieves the length of a specific field in a record with a given layout.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @param fieldIndex The index of the field whose length is to be retrieved.
   * @param fieldLayout The layout of the field whose length is to be retrieved.
   * @return Returns the length of the specified field.
   */
  function getFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (uint256) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getFieldLength(tableId, keyTuple, fieldIndex, fieldLayout);
    } else {
      return IStore(_storeAddress).getFieldLength(tableId, keyTuple, fieldIndex, fieldLayout);
    }
  }

  /**
   * @dev Retrieves the length of a specific dynamic (variable length) field in a record.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @param dynamicFieldIndex The index of the dynamic field whose length is to be retrieved.
   * @return Returns the length of the specified dynamic field.
   */
  function getDynamicFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) internal view returns (uint256) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getDynamicFieldLength(tableId, keyTuple, dynamicFieldIndex);
    } else {
      return IStore(_storeAddress).getDynamicFieldLength(tableId, keyTuple, dynamicFieldIndex);
    }
  }

  /**
   * @dev Retrieves a slice of a dynamic (variable length) field from a record.
   * @param tableId The ID of the table to which the record belongs.
   * @param keyTuple An array representing the key for the record.
   * @param dynamicFieldIndex The index of the dynamic field from which to get the slice.
   * @param start The starting index of the slice.
   * @param end The ending index of the slice.
   * @return Returns the sliced data from the specified dynamic field.
   */
  function getDynamicFieldSlice(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint256 start,
    uint256 end
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getDynamicFieldSlice(tableId, keyTuple, dynamicFieldIndex, start, end);
    } else {
      return IStore(_storeAddress).getDynamicFieldSlice(tableId, keyTuple, dynamicFieldIndex, start, end);
    }
  }
}
