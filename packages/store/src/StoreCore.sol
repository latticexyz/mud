// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { STORE_VERSION } from "./version.sol";
import { Bytes } from "./Bytes.sol";
import { Storage } from "./Storage.sol";
import { Memory } from "./Memory.sol";
import { FieldLayout, FieldLayoutLib } from "./FieldLayout.sol";
import { Schema, SchemaLib } from "./Schema.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { Slice, SliceLib } from "./Slice.sol";
import { StoreHooks, Tables, TablesTableId, ResourceIds, StoreHooksTableId } from "./codegen/index.sol";
import { _fieldLayout as TablesTableFieldLayout } from "./codegen/tables/Tables.sol";
import { IStoreErrors } from "./IStoreErrors.sol";
import { IStoreHook } from "./IStoreHook.sol";
import { StoreSwitch } from "./StoreSwitch.sol";
import { Hook, HookLib } from "./Hook.sol";
import { BEFORE_SET_RECORD, AFTER_SET_RECORD, BEFORE_SPLICE_STATIC_DATA, AFTER_SPLICE_STATIC_DATA, BEFORE_SPLICE_DYNAMIC_DATA, AFTER_SPLICE_DYNAMIC_DATA, BEFORE_DELETE_RECORD, AFTER_DELETE_RECORD } from "./storeHookTypes.sol";
import { ResourceId, ResourceIdInstance } from "./ResourceId.sol";
import { RESOURCE_TABLE, RESOURCE_OFFCHAIN_TABLE } from "./storeResourceTypes.sol";

/**
 * StoreCore includes implementations for all IStore methods.
 * StoreCoreInternal includes helper methods used by multiple StoreCore methods.
 * It's split into a separate library to make it clear that it's not intended to be outside StoreCore.
 */
library StoreCore {
  using ResourceIdInstance for ResourceId;

  event HelloStore(bytes32 indexed version);
  event Store_SetRecord(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    bytes staticData,
    PackedCounter encodedLengths,
    bytes dynamicData
  );
  event Store_SpliceStaticData(ResourceId indexed tableId, bytes32[] keyTuple, uint48 start, bytes data);
  event Store_SpliceDynamicData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes data,
    PackedCounter encodedLengths
  );
  event Store_DeleteRecord(ResourceId indexed tableId, bytes32[] keyTuple);

  /**
   * Intialize the store address to use in StoreSwitch.
   * Consumers must call this function in their constructor.
   */
  function initialize() internal {
    emit HelloStore(STORE_VERSION);

    // StoreSwitch uses the storeAddress to decide where to write data to.
    // If StoreSwitch is called in the context of a Store contract (storeAddress == address(this)),
    // StoreSwitch uses internal methods to write data instead of external calls.
    StoreSwitch.setStoreAddress(address(this));
  }

  /**
   * Register core tables.
   * Consumers must call this function in their constructor before setting
   * any table data to allow indexers to decode table events.
   */
  function registerCoreTables() internal {
    // Register core tables
    Tables.register();
    StoreHooks.register();
    ResourceIds.register();
  }

  /************************************************************************
   *
   *    SCHEMA
   *
   ************************************************************************/

  /**
   * Get the field layout for the given table ID.
   */
  function getFieldLayout(ResourceId tableId) internal view returns (FieldLayout) {
    // Explicit check for the tables table to solve the bootstraping issue
    if (ResourceId.unwrap(tableId) == ResourceId.unwrap(TablesTableId)) {
      return TablesTableFieldLayout;
    }
    return
      FieldLayout.wrap(
        Storage.loadField({
          storagePointer: StoreCoreInternal._getStaticDataLocation(TablesTableId, ResourceId.unwrap(tableId)),
          length: 32,
          offset: 0
        })
      );
  }

  /**
   * Get the key schema for the given tableId
   */
  function getKeySchema(ResourceId tableId) internal view returns (Schema keySchema) {
    keySchema = Tables._getKeySchema(tableId);
    // key schemas can be empty for singleton tables, so we can't depend on key schema for table check
    if (!ResourceIds._getExists(tableId)) {
      revert IStoreErrors.Store_TableNotFound(tableId, string(abi.encodePacked(tableId)));
    }
  }

  /**
   * Get the schema for the given tableId
   */
  function getValueSchema(ResourceId tableId) internal view returns (Schema valueSchema) {
    valueSchema = Tables._getValueSchema(tableId);
    if (valueSchema.isEmpty()) {
      revert IStoreErrors.Store_TableNotFound(tableId, string(abi.encodePacked(tableId)));
    }
  }

  /**
   * Register a new table the given config
   */
  function registerTable(
    ResourceId tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] memory keyNames,
    string[] memory fieldNames
  ) internal {
    // Verify the table ID is of type RESOURCE_TABLE
    if (tableId.getType() != RESOURCE_TABLE && tableId.getType() != RESOURCE_OFFCHAIN_TABLE) {
      revert IStoreErrors.Store_InvalidResourceType(RESOURCE_TABLE, tableId, string(abi.encodePacked(tableId)));
    }

    // Verify the field layout is valid
    fieldLayout.validate({ allowEmpty: false });

    // Verify the schema is valid
    keySchema.validate({ allowEmpty: true });
    valueSchema.validate({ allowEmpty: false });

    // Verify the number of key names matches the number of key schema types
    if (keyNames.length != keySchema.numFields()) {
      revert IStoreErrors.Store_InvalidKeyNamesLength(keySchema.numFields(), keyNames.length);
    }

    // Verify the number of value names
    if (fieldNames.length != fieldLayout.numFields()) {
      revert IStoreErrors.Store_InvalidFieldNamesLength(fieldLayout.numFields(), fieldNames.length);
    }

    // Verify the number of value schema types
    if (valueSchema.numFields() != fieldLayout.numFields()) {
      revert IStoreErrors.Store_InvalidValueSchemaLength(fieldLayout.numFields(), valueSchema.numFields());
    }

    // Verify there is no resource with this ID yet
    if (ResourceIds._getExists(tableId)) {
      revert IStoreErrors.Store_TableAlreadyExists(tableId, string(abi.encodePacked(tableId)));
    }

    // Register the table metadata
    Tables._set(tableId, fieldLayout, keySchema, valueSchema, abi.encode(keyNames), abi.encode(fieldNames));

    // Register the table ID
    ResourceIds._setExists(tableId, true);
  }

  /************************************************************************
   *
   *    REGISTER HOOKS
   *
   ************************************************************************/

  /*
   * Register hooks to be called when a record or field is set or deleted
   */
  function registerStoreHook(ResourceId tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) internal {
    // Hooks are only supported for tables, not for offchain tables
    if (tableId.getType() != RESOURCE_TABLE) {
      revert IStoreErrors.Store_InvalidResourceType(RESOURCE_TABLE, tableId, string(abi.encodePacked(tableId)));
    }

    StoreHooks.push(tableId, Hook.unwrap(HookLib.encode(address(hookAddress), enabledHooksBitmap)));
  }

  /**
   * Unregister a hook from the given tableId
   */
  function unregisterStoreHook(ResourceId tableId, IStoreHook hookAddress) internal {
    HookLib.filterListByAddress(StoreHooksTableId, tableId, address(hookAddress));
  }

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  /**
   * Set full data record for the given table ID and key tuple and field layout.
   * This overload loads the field layout from storage and is exposed externally on `IStore`.
   */
  function setRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData
  ) internal {
    setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData, getFieldLayout(tableId));
  }

  /**
   * Set full data record for the given table ID and key tuple and field layout.
   * This overload allows passing in a FieldLayout and is not exposed externally on `IStore`.
   */
  function setRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) internal {
    // Emit event to notify indexers
    emit Store_SetRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);

    // Early return if the table is an offchain table
    if (tableId.getType() != RESOURCE_TABLE) {
      return;
    }

    // Call onBeforeSetRecord hooks (before actually modifying the state, so observers have access to the previous state if needed)
    bytes21[] memory hooks = StoreHooks._get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(BEFORE_SET_RECORD)) {
        IStoreHook(hook.getAddress()).onBeforeSetRecord(
          tableId,
          keyTuple,
          staticData,
          encodedLengths,
          dynamicData,
          fieldLayout
        );
      }
    }

    // Store the static data at the static data location
    uint256 staticDataLocation = StoreCoreInternal._getStaticDataLocation(tableId, keyTuple);
    uint256 memoryPointer = Memory.dataPointer(staticData);
    Storage.store({
      storagePointer: staticDataLocation,
      offset: 0,
      memoryPointer: memoryPointer,
      length: staticData.length
    });

    // Set the dynamic data if there are dynamic fields
    if (fieldLayout.numDynamicFields() > 0) {
      // Store the dynamic data length at the dynamic data length location
      uint256 dynamicDataLengthLocation = StoreCoreInternal._getDynamicDataLengthLocation(tableId, keyTuple);
      Storage.store({ storagePointer: dynamicDataLengthLocation, data: encodedLengths.unwrap() });

      // Move the memory pointer to the start of the dynamic data
      memoryPointer = Memory.dataPointer(dynamicData);

      // For every dynamic element, slice off the dynamic data and store it at the dynamic location
      uint256 dynamicDataLocation;
      uint256 dynamicDataLength;
      for (uint8 i; i < fieldLayout.numDynamicFields(); ) {
        dynamicDataLocation = StoreCoreInternal._getDynamicDataLocation(tableId, keyTuple, i);
        dynamicDataLength = encodedLengths.atIndex(i);
        Storage.store({
          storagePointer: dynamicDataLocation,
          offset: 0,
          memoryPointer: memoryPointer,
          length: dynamicDataLength
        });
        memoryPointer += dynamicDataLength; // move the memory pointer to the start of the next dynamic data
        unchecked {
          i++;
        }
      }
    }

    // Call onAfterSetRecord hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(AFTER_SET_RECORD)) {
        IStoreHook(hook.getAddress()).onAfterSetRecord(
          tableId,
          keyTuple,
          staticData,
          encodedLengths,
          dynamicData,
          fieldLayout
        );
      }
    }
  }

  function spliceStaticData(ResourceId tableId, bytes32[] memory keyTuple, uint48 start, bytes memory data) internal {
    uint256 location = StoreCoreInternal._getStaticDataLocation(tableId, keyTuple);

    // Emit event to notify offchain indexers
    emit StoreCore.Store_SpliceStaticData({ tableId: tableId, keyTuple: keyTuple, start: start, data: data });

    // Early return if the table is an offchain table
    if (tableId.getType() != RESOURCE_TABLE) {
      return;
    }

    // Call onBeforeSpliceStaticData hooks (before actually modifying the state, so observers have access to the previous state if needed)
    bytes21[] memory hooks = StoreHooks._get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(BEFORE_SPLICE_STATIC_DATA)) {
        IStoreHook(hook.getAddress()).onBeforeSpliceStaticData({
          tableId: tableId,
          keyTuple: keyTuple,
          start: start,
          data: data
        });
      }
    }

    // Store the provided value in storage
    Storage.store({ storagePointer: location, offset: start, data: data });

    // Call onAfterSpliceStaticData hooks
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(AFTER_SPLICE_STATIC_DATA)) {
        IStoreHook(hook.getAddress()).onAfterSpliceStaticData({
          tableId: tableId,
          keyTuple: keyTuple,
          start: start,
          data: data
        });
      }
    }
  }

  function spliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes memory data
  ) internal {
    StoreCoreInternal._spliceDynamicData({
      tableId: tableId,
      keyTuple: keyTuple,
      dynamicFieldIndex: dynamicFieldIndex,
      startWithinField: startWithinField,
      deleteCount: deleteCount,
      data: data,
      previousEncodedLengths: StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple)
    });
  }

  /**
   * Set data for a field at the given index in a table with the given tableId, key tuple, loading the field layout from storage
   */
  function setField(ResourceId tableId, bytes32[] memory keyTuple, uint8 fieldIndex, bytes memory data) internal {
    setField(tableId, keyTuple, fieldIndex, data, getFieldLayout(tableId));
  }

  /**
   * Set data for a field at the given index in a table with the given tableId, key tuple and value field layout
   */
  function setField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) internal {
    if (fieldIndex < fieldLayout.numStaticFields()) {
      setStaticField(tableId, keyTuple, fieldIndex, data, fieldLayout);
    } else {
      setDynamicField(tableId, keyTuple, fieldIndex - uint8(fieldLayout.numStaticFields()), data);
    }
  }

  function setStaticField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) internal {
    spliceStaticData({
      tableId: tableId,
      keyTuple: keyTuple,
      start: uint48(StoreCoreInternal._getStaticDataOffset(fieldLayout, fieldIndex)),
      data: data
    });
  }

  function setDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    bytes memory data
  ) internal {
    // Load the previous length of the field to set from storage to compute how much data to delete
    PackedCounter previousEncodedLengths = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);
    uint40 previousFieldLength = uint40(previousEncodedLengths.atIndex(dynamicFieldIndex));

    StoreCoreInternal._spliceDynamicData({
      tableId: tableId,
      keyTuple: keyTuple,
      dynamicFieldIndex: dynamicFieldIndex,
      startWithinField: 0,
      deleteCount: previousFieldLength,
      data: data,
      previousEncodedLengths: previousEncodedLengths
    });
  }

  /**
   * Delete a record for the given tableId, key tuple and value field layout.
   * This overload loads the field layout from storage and is exposed externally on `IStore`.
   */
  function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple) internal {
    deleteRecord(tableId, keyTuple, getFieldLayout(tableId));
  }

  /**
   * Delete a record for the given tableId, key tuple and value field layout.
   * This overload allows passing in a FieldLayout and is not exposed externally on `IStore`.
   */
  function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) internal {
    // Emit event to notify indexers
    emit Store_DeleteRecord(tableId, keyTuple);

    // Early return if the table is an offchain table
    if (tableId.getType() != RESOURCE_TABLE) {
      return;
    }

    // Call onBeforeDeleteRecord hooks (before actually modifying the state, so observers have access to the previous state if needed)
    bytes21[] memory hooks = StoreHooks._get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(BEFORE_DELETE_RECORD)) {
        IStoreHook(hook.getAddress()).onBeforeDeleteRecord(tableId, keyTuple, fieldLayout);
      }
    }

    // Delete static data
    uint256 staticDataLocation = StoreCoreInternal._getStaticDataLocation(tableId, keyTuple);
    Storage.store({ storagePointer: staticDataLocation, offset: 0, data: new bytes(fieldLayout.staticDataLength()) });

    // If there are dynamic fields, set the dynamic data length to 0.
    // We don't need to delete the dynamic data because it will be overwritten when a new record is set.
    if (fieldLayout.numDynamicFields() > 0) {
      uint256 dynamicDataLengthLocation = StoreCoreInternal._getDynamicDataLengthLocation(tableId, keyTuple);
      Storage.zero({ storagePointer: dynamicDataLengthLocation, length: 32 });
    }

    // Call onAfterDeleteRecord hooks
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(AFTER_DELETE_RECORD)) {
        IStoreHook(hook.getAddress()).onAfterDeleteRecord(tableId, keyTuple, fieldLayout);
      }
    }
  }

  /**
   * Push data to a field at the dynamic field index in a table with the given table ID and keyTuple tuple
   */
  function pushToDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    bytes memory dataToPush
  ) internal {
    // Load the previous length of the field to set from storage to compute where to start to push
    PackedCounter previousEncodedLengths = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);
    uint40 previousFieldLength = uint40(previousEncodedLengths.atIndex(dynamicFieldIndex));

    // Splice the dynamic data
    StoreCoreInternal._spliceDynamicData({
      tableId: tableId,
      keyTuple: keyTuple,
      dynamicFieldIndex: dynamicFieldIndex,
      startWithinField: uint40(previousFieldLength),
      deleteCount: 0,
      data: dataToPush,
      previousEncodedLengths: previousEncodedLengths
    });
  }

  /**
   * Pop data from a field at the dynamic field index in a table with the given table ID and key tuple
   */
  function popFromDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint256 byteLengthToPop
  ) internal {
    // Load the previous length of the field to set from storage to compute where to start to push
    PackedCounter previousEncodedLengths = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);
    uint40 previousFieldLength = uint40(previousEncodedLengths.atIndex(dynamicFieldIndex));

    // Splice the dynamic data
    StoreCoreInternal._spliceDynamicData({
      tableId: tableId,
      keyTuple: keyTuple,
      dynamicFieldIndex: dynamicFieldIndex,
      startWithinField: uint40(previousFieldLength - byteLengthToPop),
      deleteCount: uint40(byteLengthToPop),
      data: new bytes(0),
      previousEncodedLengths: previousEncodedLengths
    });
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/

  /**
   * Get full record (all fields, static and dynamic data) for the given table ID and key tuple, loading the field layout from storage
   */
  function getRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple
  ) internal view returns (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) {
    return getRecord(tableId, keyTuple, getFieldLayout(tableId));
  }

  /**
   * Get full record (all fields, static and dynamic data) for the given table ID and key tuple, with the given field layout
   */
  function getRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) {
    // Get the static data length
    uint256 staticLength = fieldLayout.staticDataLength();

    // Load the static data from storage
    staticData = StoreCoreInternal._getStaticData(tableId, keyTuple, staticLength);

    // Load the dynamic data if there are dynamic fields
    uint256 numDynamicFields = fieldLayout.numDynamicFields();
    if (numDynamicFields > 0) {
      // Load the encoded dynamic data length
      encodedLengths = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);

      // Append dynamic data
      dynamicData = new bytes(encodedLengths.total());
      uint256 memoryPointer = Memory.dataPointer(dynamicData);

      for (uint8 i; i < numDynamicFields; i++) {
        uint256 dynamicDataLocation = StoreCoreInternal._getDynamicDataLocation(tableId, keyTuple, i);
        uint256 length = encodedLengths.atIndex(i);
        Storage.load({ storagePointer: dynamicDataLocation, length: length, offset: 0, memoryPointer: memoryPointer });
        // Advance memoryPointer by the length of this dynamic field
        memoryPointer += length;
      }
    }
  }

  /**
   * Get a single field from the given table ID and key tuple, loading the field layout from storage
   */
  function getField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex
  ) internal view returns (bytes memory) {
    return getField(tableId, keyTuple, fieldIndex, getFieldLayout(tableId));
  }

  /**
   * Get a single field from the given table ID and key tuple, with the given value field layout
   */
  function getField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory) {
    if (fieldIndex < fieldLayout.numStaticFields()) {
      return StoreCoreInternal._getStaticFieldBytes(tableId, keyTuple, fieldIndex, fieldLayout);
    } else {
      return getDynamicField(tableId, keyTuple, fieldIndex - uint8(fieldLayout.numStaticFields()));
    }
  }

  /**
   * Get a single static field from the given table ID and key tuple, with the given value field layout.
   * Note: the field value is left-aligned in the returned bytes32, the rest of the word is not zeroed out.
   * Consumers are expected to truncate the returned value as needed.
   */
  function getStaticField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (bytes32) {
    // Get the length, storage location and offset of the static field
    // and load the data from storage
    return
      Storage.loadField({
        storagePointer: StoreCoreInternal._getStaticDataLocation(tableId, keyTuple),
        length: fieldLayout.atIndex(fieldIndex),
        offset: StoreCoreInternal._getStaticDataOffset(fieldLayout, fieldIndex)
      });
  }

  /**
   * Get a single dynamic field from the given table ID and key tuple, with the given value field layout
   */
  function getDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) internal view returns (bytes memory) {
    // Get the storage location of the dynamic field
    // and load the data from storage
    return
      Storage.load({
        storagePointer: StoreCoreInternal._getDynamicDataLocation(tableId, keyTuple, dynamicFieldIndex),
        length: StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple).atIndex(dynamicFieldIndex),
        offset: 0
      });
  }

  /**
   * Get the byte length of a single field from the given table ID and key tuple
   */
  function getFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex
  ) internal view returns (uint256) {
    return getFieldLength(tableId, keyTuple, fieldIndex, getFieldLayout(tableId));
  }

  /**
   * Get the byte length of a single field from the given table ID and key tuple, with the given value field layout
   */
  function getFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (uint256) {
    uint8 numStaticFields = uint8(fieldLayout.numStaticFields());
    if (fieldIndex < numStaticFields) {
      return fieldLayout.atIndex(fieldIndex);
    } else {
      return getDynamicFieldLength(tableId, keyTuple, fieldIndex - numStaticFields);
    }
  }

  /**
   * Get the byte length of a single dynamic field from the given table ID and key tuple
   */
  function getDynamicFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) internal view returns (uint256) {
    return StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple).atIndex(dynamicFieldIndex);
  }

  /**
   * Get a byte slice (including start, excluding end) of a single dynamic field from the given table ID and key tuple, with the given value field layout.
   */
  function getDynamicFieldSlice(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint256 start,
    uint256 end
  ) internal view returns (bytes memory) {
    // Verify the accessed data is within the bounds of the dynamic field.
    // This is necessary because we don't delete the dynamic data when a record is deleted,
    // but only decrease its length.
    PackedCounter encodedLengths = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);
    uint256 fieldLength = encodedLengths.atIndex(dynamicFieldIndex);
    if (start >= fieldLength || end > fieldLength) {
      revert IStoreErrors.Store_IndexOutOfBounds(fieldLength, start >= fieldLength ? start : end - 1);
    }

    // Get the length and storage location of the dynamic field
    uint256 location = StoreCoreInternal._getDynamicDataLocation(tableId, keyTuple, dynamicFieldIndex);

    return Storage.load({ storagePointer: location, length: end - start, offset: start });
  }
}

library StoreCoreInternal {
  using ResourceIdInstance for ResourceId;

  bytes32 internal constant SLOT = keccak256("mud.store");
  bytes32 internal constant DYNMAIC_DATA_SLOT = keccak256("mud.store.dynamicData");
  bytes32 internal constant DYNAMIC_DATA_LENGTH_SLOT = keccak256("mud.store.dynamicDataLength");

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  function _spliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes memory data,
    PackedCounter previousEncodedLengths
  ) internal {
    // Splicing dynamic data is not supported for offchain tables, because it
    // requires reading the previous encoded lengths from storage
    if (tableId.getType() != RESOURCE_TABLE) {
      revert IStoreErrors.Store_InvalidResourceType(RESOURCE_TABLE, tableId, string(abi.encodePacked(tableId)));
    }

    uint256 previousFieldLength = previousEncodedLengths.atIndex(dynamicFieldIndex);
    uint256 updatedFieldLength = previousFieldLength - deleteCount + data.length;

    // If the total length of the field is changed, the data has to be appended/removed at the end of the field.
    // Otherwise offchain indexers would shift the data after inserted data, while onchain the data is truncated at the end.
    if (previousFieldLength != updatedFieldLength && startWithinField + deleteCount != previousFieldLength) {
      revert IStoreErrors.Store_InvalidSplice(startWithinField, deleteCount, uint40(previousFieldLength));
    }

    // The start index can't be larger than the previous length of the field
    if (startWithinField > previousFieldLength) {
      revert IStoreErrors.Store_IndexOutOfBounds(previousFieldLength, startWithinField);
    }

    // Compute start index for the splice
    uint256 start = startWithinField;
    unchecked {
      // (safe because it's a few uint40 values, which can't overflow uint48)
      for (uint8 i; i < dynamicFieldIndex; i++) {
        start += previousEncodedLengths.atIndex(i);
      }
    }

    // Update the encoded length
    PackedCounter updatedEncodedLengths = previousEncodedLengths.setAtIndex(dynamicFieldIndex, updatedFieldLength);

    // Emit event to notify offchain indexers
    emit StoreCore.Store_SpliceDynamicData({
      tableId: tableId,
      keyTuple: keyTuple,
      start: uint48(start),
      deleteCount: deleteCount,
      data: data,
      encodedLengths: updatedEncodedLengths
    });

    // Call onBeforeSpliceDynamicData hooks (before actually modifying the state, so observers have access to the previous state if needed)
    bytes21[] memory hooks = StoreHooks._get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(BEFORE_SPLICE_DYNAMIC_DATA)) {
        IStoreHook(hook.getAddress()).onBeforeSpliceDynamicData({
          tableId: tableId,
          keyTuple: keyTuple,
          dynamicFieldIndex: dynamicFieldIndex,
          startWithinField: startWithinField,
          deleteCount: deleteCount,
          data: data,
          encodedLengths: updatedEncodedLengths
        });
      }
    }

    // Store the updated encoded lengths in storage
    if (previousFieldLength != updatedFieldLength) {
      uint256 dynamicSchemaLengthSlot = _getDynamicDataLengthLocation(tableId, keyTuple);
      Storage.store({ storagePointer: dynamicSchemaLengthSlot, data: updatedEncodedLengths.unwrap() });
    }

    // Store the provided value in storage
    {
      uint256 dynamicDataLocation = _getDynamicDataLocation(tableId, keyTuple, dynamicFieldIndex);
      Storage.store({ storagePointer: dynamicDataLocation, offset: startWithinField, data: data });
    }

    // Call onAfterSpliceDynamicData hooks
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(AFTER_SPLICE_DYNAMIC_DATA)) {
        IStoreHook(hook.getAddress()).onAfterSpliceDynamicData({
          tableId: tableId,
          keyTuple: keyTuple,
          dynamicFieldIndex: dynamicFieldIndex,
          startWithinField: startWithinField,
          deleteCount: deleteCount,
          data: data,
          encodedLengths: updatedEncodedLengths
        });
      }
    }
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/

  /**
   * Get full static data for the given table ID and key tuple, with the given static length
   */
  function _getStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint256 length
  ) internal view returns (bytes memory) {
    if (length == 0) return "";

    // Load the data from storage
    uint256 location = _getStaticDataLocation(tableId, keyTuple);
    return Storage.load({ storagePointer: location, length: length, offset: 0 });
  }

  /**
   * Get a single static field from the given table ID and key tuple, with the given value field layout.
   * Returns dynamic bytes memory in the size of the field.
   */
  function _getStaticFieldBytes(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory) {
    // Get the length, storage location and offset of the static field
    // and load the data from storage
    return
      Storage.load({
        storagePointer: StoreCoreInternal._getStaticDataLocation(tableId, keyTuple),
        length: fieldLayout.atIndex(fieldIndex),
        offset: StoreCoreInternal._getStaticDataOffset(fieldLayout, fieldIndex)
      });
  }

  /************************************************************************
   *
   *    HELPER FUNCTIONS
   *
   ************************************************************************/

  /////////////////////////////////////////////////////////////////////////
  //    STATIC DATA
  /////////////////////////////////////////////////////////////////////////

  /**
   * Compute the storage location based on tableId id and key tuple
   */
  function _getStaticDataLocation(ResourceId tableId, bytes32[] memory keyTuple) internal pure returns (uint256) {
    return uint256(SLOT ^ keccak256(abi.encodePacked(tableId, keyTuple)));
  }

  /**
   * Compute the storage location based on tableId id and key (equivalent to keyTuple = [key])
   */
  function _getStaticDataLocation(ResourceId tableId, bytes32 key) internal pure returns (uint256) {
    return uint256(SLOT ^ keccak256(abi.encodePacked(tableId, key)));
  }

  /**
   * Get storage offset for the given value field layout and (static length) index
   */
  function _getStaticDataOffset(FieldLayout fieldLayout, uint8 fieldIndex) internal pure returns (uint256) {
    uint256 offset = 0;
    for (uint256 i; i < fieldIndex; i++) {
      offset += fieldLayout.atIndex(i);
    }
    return offset;
  }

  /////////////////////////////////////////////////////////////////////////
  //    DYNAMIC DATA
  /////////////////////////////////////////////////////////////////////////

  /**
   * Compute the storage location based on tableId id and index tuple
   */
  function _getDynamicDataLocation(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) internal pure returns (uint256) {
    return uint256(DYNMAIC_DATA_SLOT ^ bytes1(dynamicFieldIndex) ^ keccak256(abi.encodePacked(tableId, keyTuple)));
  }

  /**
   * Compute the storage location for the length of the dynamic data
   */
  function _getDynamicDataLengthLocation(
    ResourceId tableId,
    bytes32[] memory keyTuple
  ) internal pure returns (uint256) {
    return uint256(DYNAMIC_DATA_LENGTH_SLOT ^ keccak256(abi.encodePacked(tableId, keyTuple)));
  }

  /**
   * Load the encoded dynamic data length from storage for the given table ID and key tuple
   */
  function _loadEncodedDynamicDataLength(
    ResourceId tableId,
    bytes32[] memory keyTuple
  ) internal view returns (PackedCounter) {
    // Load dynamic data length from storage
    return PackedCounter.wrap(Storage.load({ storagePointer: _getDynamicDataLengthLocation(tableId, keyTuple) }));
  }
}
