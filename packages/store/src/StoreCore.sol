// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { STORE_VERSION } from "./version.sol";
import { Bytes } from "./Bytes.sol";
import { Storage } from "./Storage.sol";
import { Memory } from "./Memory.sol";
import { FieldLayout, FieldLayoutLib } from "./FieldLayout.sol";
import { Schema, SchemaLib } from "./Schema.sol";
import { EncodedLengths } from "./EncodedLengths.sol";
import { Slice, SliceLib } from "./Slice.sol";
import { Tables, ResourceIds, StoreHooks } from "./codegen/index.sol";
import { IStoreErrors } from "./IStoreErrors.sol";
import { IStoreHook } from "./IStoreHook.sol";
import { StoreSwitch } from "./StoreSwitch.sol";
import { Hook, HookLib } from "./Hook.sol";
import { BEFORE_SET_RECORD, AFTER_SET_RECORD, BEFORE_SPLICE_STATIC_DATA, AFTER_SPLICE_STATIC_DATA, BEFORE_SPLICE_DYNAMIC_DATA, AFTER_SPLICE_DYNAMIC_DATA, BEFORE_DELETE_RECORD, AFTER_DELETE_RECORD } from "./storeHookTypes.sol";
import { ResourceId } from "./ResourceId.sol";
import { RESOURCE_TABLE, RESOURCE_OFFCHAIN_TABLE } from "./storeResourceTypes.sol";
import { IStoreEvents } from "./IStoreEvents.sol";

/**
 * @title StoreCore Library
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @notice This library includes implementations for all IStore methods and events related to the store actions.
 */
library StoreCore {
  /**
   * @notice Initialize the store address in StoreSwitch.
   * @dev Consumers must call this function in their constructor.
   * StoreSwitch uses the storeAddress to decide where to write data to.
   * If StoreSwitch is called in the context of a Store contract (storeAddress == address(this)),
   * StoreSwitch uses internal methods to write data instead of external calls.
   */
  function initialize() internal {
    StoreSwitch.setStoreAddress(address(this));
  }

  /**
   * @notice Register Store protocol's internal tables in the store.
   * @dev Consumers must call this function in their constructor before setting
   * any table data to allow indexers to decode table events.
   */
  function registerInternalTables() internal {
    // Because `registerTable` writes to both `Tables` and `ResourceIds`, we can't use it
    // directly here without creating a race condition, where we'd write to one or the other
    // before they exist (depending on the order of registration).
    //
    // Instead, we'll register them manually, writing everything to the `Tables` table first,
    // then the `ResourceIds` table. The logic here ought to be kept in sync with the internals
    // of the `registerTable` function below.
    if (ResourceIds._getExists(Tables._tableId)) {
      revert IStoreErrors.Store_TableAlreadyExists(Tables._tableId, string(abi.encodePacked(Tables._tableId)));
    }
    if (ResourceIds._getExists(ResourceIds._tableId)) {
      revert IStoreErrors.Store_TableAlreadyExists(
        ResourceIds._tableId,
        string(abi.encodePacked(ResourceIds._tableId))
      );
    }
    Tables._set(
      Tables._tableId,
      Tables._fieldLayout,
      Tables._keySchema,
      Tables._valueSchema,
      abi.encode(Tables.getKeyNames()),
      abi.encode(Tables.getFieldNames())
    );
    Tables._set(
      ResourceIds._tableId,
      ResourceIds._fieldLayout,
      ResourceIds._keySchema,
      ResourceIds._valueSchema,
      abi.encode(ResourceIds.getKeyNames()),
      abi.encode(ResourceIds.getFieldNames())
    );
    ResourceIds._setExists(Tables._tableId, true);
    ResourceIds._setExists(ResourceIds._tableId, true);

    // Now we can register the rest of the core tables as regular tables.
    StoreHooks.register();
  }

  /************************************************************************
   *
   *    SCHEMA
   *
   ************************************************************************/

  /**
   * @notice Get the field layout for the given table ID.
   * @param tableId The ID of the table for which to get the field layout.
   * @return The field layout for the given table ID.
   */
  function getFieldLayout(ResourceId tableId) internal view returns (FieldLayout) {
    // Explicit check for the Tables table to solve the bootstraping issue
    // of the Tables table not having a field layout before it is registered
    // since the field layout is stored in the Tables table.
    if (ResourceId.unwrap(tableId) == ResourceId.unwrap(Tables._tableId)) {
      return Tables._fieldLayout;
    }
    return
      FieldLayout.wrap(
        Storage.loadField({
          storagePointer: StoreCoreInternal._getStaticDataLocation(Tables._tableId, ResourceId.unwrap(tableId)),
          length: 32,
          offset: 0
        })
      );
  }

  /**
   * @notice Get the key schema for the given table ID.
   * @dev Reverts if the table ID is not registered.
   * @param tableId The ID of the table for which to get the key schema.
   * @return keySchema The key schema for the given table ID.
   */
  function getKeySchema(ResourceId tableId) internal view returns (Schema keySchema) {
    keySchema = Tables._getKeySchema(tableId);
    // key schemas can be empty for singleton tables, so we can't depend on key schema for table check
    if (!ResourceIds._getExists(tableId)) {
      revert IStoreErrors.Store_TableNotFound(tableId, string(abi.encodePacked(tableId)));
    }
  }

  /**
   * @notice Get the value schema for the given table ID.
   * @dev Reverts if the table ID is not registered.
   * @param tableId The ID of the table for which to get the value schema.
   * @return valueSchema The value schema for the given table ID.
   */
  function getValueSchema(ResourceId tableId) internal view returns (Schema valueSchema) {
    valueSchema = Tables._getValueSchema(tableId);
    if (valueSchema.isEmpty()) {
      revert IStoreErrors.Store_TableNotFound(tableId, string(abi.encodePacked(tableId)));
    }
  }

  /**
   * @notice Register a new table with the given configuration.
   * @dev This method reverts if
   * - The table ID is not of type RESOURCE_TABLE or RESOURCE_OFFCHAIN_TABLE.
   * - The field layout is invalid.
   * - The key schema is invalid.
   * - The value schema is invalid.
   * - The number of key names does not match the number of key schema types.
   * - The number of field names does not match the number of field layout fields.
   * @param tableId The ID of the table to register.
   * @param fieldLayout The field layout of the table.
   * @param keySchema The key schema of the table.
   * @param valueSchema The value schema of the table.
   * @param keyNames The names of the keys in the table.
   * @param fieldNames The names of the fields in the table.
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
    fieldLayout.validate();

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
    if (valueSchema.numStaticFields() != fieldLayout.numStaticFields()) {
      revert IStoreErrors.Store_InvalidValueSchemaStaticLength(
        fieldLayout.numStaticFields(),
        valueSchema.numStaticFields()
      );
    }
    if (valueSchema.numDynamicFields() != fieldLayout.numDynamicFields()) {
      revert IStoreErrors.Store_InvalidValueSchemaDynamicLength(
        fieldLayout.numDynamicFields(),
        valueSchema.numDynamicFields()
      );
    }

    // Verify that static field lengths are consistent between Schema and FieldLayout
    for (uint256 i; i < fieldLayout.numStaticFields(); i++) {
      if (fieldLayout.atIndex(i) != valueSchema.atIndex(i).getStaticByteLength()) {
        revert IStoreErrors.Store_InvalidStaticDataLength(
          fieldLayout.atIndex(i),
          valueSchema.atIndex(i).getStaticByteLength()
        );
      }
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

  /**
   * @notice Register hooks to be called when a record or field is set or deleted.
   * @dev This method reverts for all resource IDs other than tables.
   * Hooks are not supported for offchain tables.
   * @param tableId The ID of the table to register the hook for.
   * @param hookAddress The address of the hook contract to register.
   * @param enabledHooksBitmap The bitmap of enabled hooks.
   */
  function registerStoreHook(ResourceId tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) internal {
    // Hooks are only supported for tables, not for offchain tables
    if (tableId.getType() != RESOURCE_TABLE) {
      revert IStoreErrors.Store_InvalidResourceType(RESOURCE_TABLE, tableId, string(abi.encodePacked(tableId)));
    }

    // Require the table to exist
    if (!ResourceIds._getExists(tableId)) {
      revert IStoreErrors.Store_TableNotFound(tableId, string(abi.encodePacked(tableId)));
    }

    StoreHooks._push(tableId, Hook.unwrap(HookLib.encode(address(hookAddress), enabledHooksBitmap)));
  }

  /**
   * @notice Unregister a hook from the given table ID.
   * @param tableId The ID of the table to unregister the hook from.
   * @param hookAddress The address of the hook to unregister.
   */
  function unregisterStoreHook(ResourceId tableId, IStoreHook hookAddress) internal {
    HookLib.filterListByAddress(StoreHooks._tableId, tableId, address(hookAddress));
  }

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  /**
   * @notice Set a full record for the given table ID and key tuple.
   * @dev Calling this method emits a Store_SetRecord event.
   * This method internally calls another overload of setRecord by fetching the field layout for the given table ID.
   * If the field layout is available to the caller, it is recommended to use the other overload to avoid an additional storage read.
   * @param tableId The ID of the table to set the record for.
   * @param keyTuple An array representing the composite key for the record.
   * @param staticData The static data of the record.
   * @param encodedLengths The encoded lengths of the dynamic data of the record.
   * @param dynamicData The dynamic data of the record.
   */
  function setRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    EncodedLengths encodedLengths,
    bytes memory dynamicData
  ) internal {
    setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData, getFieldLayout(tableId));
  }

  /**
   * @notice Set a full data record for the given table ID, key tuple, and field layout.
   * @dev For onchain tables, the method emits a `Store_SetRecord` event, updates the data in storage,
   * calls `onBeforeSetRecord` hooks before actually modifying the state, and calls `onAfterSetRecord`
   * hooks after modifying the state. For offchain tables, the method returns early after emitting the
   * event without calling hooks or modifying the state.
   * @param tableId The ID of the table to set the record for.
   * @param keyTuple An array representing the composite key for the record.
   * @param staticData The static data of the record.
   * @param encodedLengths The encoded lengths of the dynamic data of the record.
   * @param dynamicData The dynamic data of the record.
   * @param fieldLayout The field layout for the record.
   */
  function setRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    EncodedLengths encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) internal {
    // Early return if the table is an offchain table
    if (tableId.getType() == RESOURCE_OFFCHAIN_TABLE) {
      // Emit event to notify indexers
      emit IStoreEvents.Store_SetRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
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

    // Emit event to notify indexers
    emit IStoreEvents.Store_SetRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);

    // Store the static data at the static data location
    uint256 staticDataLocation = StoreCoreInternal._getStaticDataLocation(tableId, keyTuple);
    uint256 memoryPointer = Memory.dataPointer(staticData);
    Storage.store({
      storagePointer: staticDataLocation,
      offset: 0,
      length: staticData.length,
      memoryPointer: memoryPointer
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
          length: dynamicDataLength,
          memoryPointer: memoryPointer
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

  /**
   * @notice Splice the static data for the given table ID and key tuple.
   * @dev This method emits a `Store_SpliceStaticData` event, updates the data in storage, and calls
   * `onBeforeSpliceStaticData` and `onAfterSpliceStaticData` hooks.
   * For offchain tables, it returns early after emitting the event.
   * @param tableId The ID of the table to splice the static data for.
   * @param keyTuple An array representing the composite key for the record.
   * @param start The start position in bytes for the splice operation.
   * @param data The data to write to the static data of the record at the start byte.
   */
  function spliceStaticData(ResourceId tableId, bytes32[] memory keyTuple, uint48 start, bytes memory data) internal {
    // Early return if the table is an offchain table
    if (tableId.getType() == RESOURCE_OFFCHAIN_TABLE) {
      // Emit event to notify offchain indexers
      emit IStoreEvents.Store_SpliceStaticData({ tableId: tableId, keyTuple: keyTuple, start: start, data: data });
      return;
    }

    uint256 location = StoreCoreInternal._getStaticDataLocation(tableId, keyTuple);

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

    // Emit event to notify offchain indexers
    emit IStoreEvents.Store_SpliceStaticData({ tableId: tableId, keyTuple: keyTuple, start: start, data: data });

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

  /**
   * @notice Splice the dynamic data for the given table ID, key tuple, and dynamic field index.
   * @dev This method emits a `Store_SpliceDynamicData` event, updates the data in storage, and calls
   * `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData` hooks.
   * For offchain tables, it returns early after emitting the event.
   * @param tableId The ID of the table to splice the dynamic data for.
   * @param keyTuple An array representing the composite key for the record.
   * @param dynamicFieldIndex The index of the dynamic field to splice. (Dynamic field index = field index - number of static fields)
   * @param startWithinField The start position within the field for the splice operation.
   * @param deleteCount The number of bytes to delete in the splice operation.
   * @param data The data to insert into the dynamic data of the record at the start byte.
   */
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
   * @notice Set data for a field at the given index in a table with the given tableId, key tuple, and value field layout.
   * @dev This method internally calls another overload of setField by fetching the field layout for the given table ID.
   * If the field layout is available to the caller, it is recommended to use the other overload to avoid an additional storage read.
   * This function emits a `Store_SpliceStaticData` or `Store_SpliceDynamicData` event and calls the corresponding hooks.
   * For offchain tables, it returns early after emitting the event.
   * @param tableId The ID of the table to set the field for.
   * @param keyTuple An array representing the key for the record.
   * @param fieldIndex The index of the field to set.
   * @param data The data to set for the field.
   */
  function setField(ResourceId tableId, bytes32[] memory keyTuple, uint8 fieldIndex, bytes memory data) internal {
    setField(tableId, keyTuple, fieldIndex, data, getFieldLayout(tableId));
  }

  /**
   * @notice Set data for a field at the given index in a table with the given tableId, key tuple, and value field layout.
   * @dev This method internally calls to `setStaticField` or `setDynamicField` based on the field index and layout.
   * Calling `setStaticField` or `setDynamicField` directly is recommended if the caller is aware of the field layout.
   * This function emits a `Store_SpliceStaticData` or `Store_SpliceDynamicData` event, updates the data in storage,
   * and calls the corresponding hooks.
   * For offchain tables, it returns early after emitting the event.
   * @param tableId The ID of the table to set the field for.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldIndex The index of the field to set.
   * @param data The data to set for the field.
   * @param fieldLayout The field layout for the record.
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

  /**
   * @notice Set a static field for the given table ID, key tuple, field index, and field layout.
   * @dev This method emits a `Store_SpliceStaticData` event, updates the data in storage and calls the
   * `onBeforeSpliceStaticData` and `onAfterSpliceStaticData` hooks.
   * For offchain tables, it returns early after emitting the event.
   * @param tableId The ID of the table to set the static field for.
   * @param keyTuple An array representing the key for the record.
   * @param fieldIndex The index of the field to set.
   * @param data The data to set for the static field.
   * @param fieldLayout The field layout for the record.
   */
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

  /**
   * @notice Set a dynamic field for the given table ID, key tuple, and dynamic field index.
   * @dev This method emits a `Store_SpliceDynamicData` event, updates the data in storage and calls the
   * `onBeforeSpliceDynamicaData` and `onAfterSpliceDynamicData` hooks.
   * For offchain tables, it returns early after emitting the event.
   * @param tableId The ID of the table to set the dynamic field for.
   * @param keyTuple An array representing the composite key for the record.
   * @param dynamicFieldIndex The index of the dynamic field to set. (Dynamic field index = field index - number of static fields).
   * @param data The data to set for the dynamic field.
   */
  function setDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    bytes memory data
  ) internal {
    // Load the previous length of the field to set from storage to compute how much data to delete
    EncodedLengths previousEncodedLengths = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);
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
   * @notice Delete a record for the given table ID and key tuple.
   * @dev This method internally calls another overload of deleteRecord by fetching the field layout for the given table ID.
   * This method deletes static data and sets the dynamic data length to 0, but does not
   * actually modify the dynamic data. It emits a `Store_DeleteRecord` event and emits the
   * `onBeforeDeleteRecord` and `onAfterDeleteRecord` hooks.
   * For offchain tables, it returns early after emitting the event.
   * @param tableId The ID of the table to delete the record from.
   * @param keyTuple An array representing the composite key for the record.
   */
  function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple) internal {
    deleteRecord(tableId, keyTuple, getFieldLayout(tableId));
  }

  /**
   * @notice Delete a record for the given table ID and key tuple.
   * @dev This method deletes static data and sets the dynamic data length to 0, but does not
   * actually modify the dynamic data. It emits a `Store_DeleteRecord` event and emits the
   * `onBeforeDeleteRecord` and `onAfterDeleteRecord` hooks.
   * For offchain tables, it returns early after emitting the event.
   * @param tableId The ID of the table to delete the record from.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldLayout The field layout for the record.
   */
  function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) internal {
    // Early return if the table is an offchain table
    if (tableId.getType() == RESOURCE_OFFCHAIN_TABLE) {
      // Emit event to notify indexers
      emit IStoreEvents.Store_DeleteRecord(tableId, keyTuple);
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

    // Emit event to notify indexers
    emit IStoreEvents.Store_DeleteRecord(tableId, keyTuple);

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
   * @notice Push data to a field at the dynamic field index in a table with the given table ID and key tuple.
   * @dev This method emits a `Store_SpliceDynamicData` event, updates the data in storage and calls the
   * `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData` hooks.
   * For offchain tables, it returns early after emitting the event.
   * @param tableId The ID of the table to push data to the dynamic field.
   * @param keyTuple An array representing the composite key for the record.
   * @param dynamicFieldIndex The index of the dynamic field to push data to.
   * @param dataToPush The data to push to the dynamic field.
   */
  function pushToDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    bytes memory dataToPush
  ) internal {
    // Load the previous length of the field to set from storage to compute where to start to push
    EncodedLengths previousEncodedLengths = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);
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
   * @notice Pop data from a field at the dynamic field index in a table with the given table ID and key tuple.
   * @dev This method emits a `Store_SpliceDynamicData` event, updates the data in storage and calls the
   * `onBeforeSpliceDynamicData` and `onAfterSpliceDynamicData` hooks.
   * For offchain tables, it returns early after emitting the event.
   * @param tableId The ID of the table to pop data from the dynamic field.
   * @param keyTuple An array representing the composite key for the record.
   * @param dynamicFieldIndex The index of the dynamic field to pop data from.
   * @param byteLengthToPop The byte length to pop from the dynamic field.
   */
  function popFromDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint256 byteLengthToPop
  ) internal {
    // Load the previous length of the field to set from storage to compute where to start to push
    EncodedLengths previousEncodedLengths = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);
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
   * @notice Get the full record (all fields, static and dynamic data) for the given table ID and key tuple.
   * @dev This function internally calls another overload of `getRecord`, loading the field layout from storage.
   * If the field layout is available to the caller, it is recommended to use the other overload to avoid an additional storage read.
   * @param tableId The ID of the table to get the record from.
   * @param keyTuple An array representing the composite key for the record.
   * @return staticData The static data of the record.
   * @return encodedLengths The encoded lengths of the dynamic data of the record.
   * @return dynamicData The dynamic data of the record.
   */
  function getRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple
  ) internal view returns (bytes memory staticData, EncodedLengths encodedLengths, bytes memory dynamicData) {
    return getRecord(tableId, keyTuple, getFieldLayout(tableId));
  }

  /**
   * @notice Get the full record (all fields, static and dynamic data) for the given table ID and key tuple, with the given field layout.
   * @param tableId The ID of the table to get the record from.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldLayout The field layout for the record.
   * @return staticData The static data of the record.
   * @return encodedLengths The encoded lengths of the dynamic data of the record.
   * @return dynamicData The dynamic data of the record.
   */
  function getRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory staticData, EncodedLengths encodedLengths, bytes memory dynamicData) {
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
        Storage.load({ storagePointer: dynamicDataLocation, offset: 0, length: length, memoryPointer: memoryPointer });
        // Advance memoryPointer by the length of this dynamic field
        memoryPointer += length;
      }
    }
  }

  /**
   * @notice Get a single field from the given table ID and key tuple.
   * @dev This function internally calls another overload of `getField`, loading the field layout from storage.
   * @param tableId The ID of the table to get the field from.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldIndex The index of the field to get.
   * @return The data of the field.
   */
  function getField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex
  ) internal view returns (bytes memory) {
    return getField(tableId, keyTuple, fieldIndex, getFieldLayout(tableId));
  }

  /**
   * @notice Get a single field from the given table ID and key tuple, with the given field layout.
   * @param tableId The ID of the table to get the field from.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldIndex The index of the field to get.
   * @param fieldLayout The field layout for the record.
   * @return The data of the field.
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
   * @notice Get a single static field from the given table ID and key tuple, with the given value field layout.
   * @dev The field value is left-aligned in the returned bytes32, the rest of the word is not zeroed out.
   * Consumers are expected to truncate the returned value as needed.
   * @param tableId The ID of the table to get the static field from.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldIndex The index of the field to get.
   * @param fieldLayout The field layout for the record.
   * @return The data of the static field.
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
   * @notice Get a single dynamic field from the given table ID and key tuple.
   * @param tableId The ID of the table to get the dynamic field from.
   * @param keyTuple An array representing the composite key for the record.
   * @param dynamicFieldIndex The index of the dynamic field to get, relative to the start of the dynamic fields.
   * (Dynamic field index = field index - number of static fields)
   * @return The data of the dynamic field.
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
        offset: 0,
        length: StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple).atIndex(dynamicFieldIndex)
      });
  }

  /**
   * @notice Get the byte length of a single field from the given table ID and key tuple.
   * @dev This function internally calls another overload of `getFieldLength`, loading the field layout from storage.
   * If the field layout is available to the caller, it is recommended to use the other overload to avoid an additional storage read.
   * @param tableId The ID of the table to get the field length from.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldIndex The index of the field to get the length for.
   * @return The byte length of the field.
   */
  function getFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex
  ) internal view returns (uint256) {
    return getFieldLength(tableId, keyTuple, fieldIndex, getFieldLayout(tableId));
  }

  /**
   * @notice Get the byte length of a single field from the given table ID and key tuple.
   * @param tableId The ID of the table to get the field length from.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldIndex The index of the field to get the length for.
   * @param fieldLayout The field layout for the record.
   * @return The byte length of the field.
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
   * @notice Get the byte length of a single dynamic field from the given table ID and key tuple.
   * @param tableId The ID of the table to get the dynamic field length from.
   * @param keyTuple An array representing the composite key for the record.
   * @param dynamicFieldIndex The index of the dynamic field to get the length for, relative to the start of the dynamic fields.
   * (Dynamic field index = field index - number of static fields)
   * @return The byte length of the dynamic field.
   */
  function getDynamicFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) internal view returns (uint256) {
    return StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple).atIndex(dynamicFieldIndex);
  }

  /**
   * @notice Get a byte slice (including start, excluding end) of a single dynamic field from the given table ID and key tuple.
   * @param tableId The ID of the table to get the dynamic field slice from.
   * @param keyTuple An array representing the composite key for the record.
   * @param dynamicFieldIndex The index of the dynamic field to get the slice from, relative to the start of the dynamic fields.
   * (Dynamic field index = field index - number of static fields)
   * @param start The start index within the dynamic field for the slice operation (inclusive).
   * @param end The end index within the dynamic field for the slice operation (exclusive).
   * @return The byte slice of the dynamic field.
   */
  function getDynamicFieldSlice(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint256 start,
    uint256 end
  ) internal view returns (bytes memory) {
    // Verify the slice bounds are valid
    if (start > end) {
      revert IStoreErrors.Store_InvalidBounds(start, end);
    }
    // Verify the accessed data is within the bounds of the dynamic field.
    // This is necessary because we don't delete the dynamic data when a record is deleted,
    // but only decrease its length.
    EncodedLengths encodedLengths = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);
    uint256 fieldLength = encodedLengths.atIndex(dynamicFieldIndex);
    if (start >= fieldLength || end > fieldLength) {
      revert IStoreErrors.Store_IndexOutOfBounds(fieldLength, start >= fieldLength ? start : end - 1);
    }

    // Get the length and storage location of the dynamic field
    uint256 location = StoreCoreInternal._getDynamicDataLocation(tableId, keyTuple, dynamicFieldIndex);

    unchecked {
      return Storage.load({ storagePointer: location, offset: start, length: end - start });
    }
  }
}

/**
 * @title StoreCoreInternal
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This library contains internal functions used by StoreCore.
 * They are not intended to be used directly by consumers of StoreCore.
 */
library StoreCoreInternal {
  bytes32 internal constant SLOT = keccak256("mud.store");
  bytes32 internal constant DYNAMIC_DATA_SLOT = keccak256("mud.store.dynamicData");
  bytes32 internal constant DYNAMIC_DATA_LENGTH_SLOT = keccak256("mud.store.dynamicDataLength");

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  /**
   * @notice Splice dynamic data in the store.
   * @dev This function checks various conditions to ensure the operation is valid.
   * It emits a `Store_SpliceDynamicData` event, calls `onBeforeSpliceDynamicData` hooks before actually modifying the storage,
   * and calls `onAfterSpliceDynamicData` hooks after modifying the storage.
   * It reverts with `Store_InvalidResourceType` if the table ID is not a table.
   * (Splicing dynamic data is not supported for offchain tables, as it requires reading the previous encoded lengths from storage.)
   * It reverts with `Store_InvalidSplice` if the splice total length of the field is changed but the splice is not at the end of the field.
   * It reverts with `Store_IndexOutOfBounds` if the start index is larger than the previous length of the field.
   * @param tableId The ID of the table to splice dynamic data.
   * @param keyTuple An array representing the composite key for the record.
   * @param dynamicFieldIndex The index of the dynamic field to splice data, relative to the start of the dynamic fields.
   * (Dynamic field index = field index - number of static fields)
   * @param startWithinField The start index within the field for the splice operation.
   * @param deleteCount The number of bytes to delete in the splice operation.
   * @param data The data to insert into the dynamic data of the record at the start byte.
   * @param previousEncodedLengths The previous encoded lengths of the dynamic data of the record.
   */
  function _spliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes memory data,
    EncodedLengths previousEncodedLengths
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

    // Update the encoded length
    EncodedLengths updatedEncodedLengths = previousEncodedLengths.setAtIndex(dynamicFieldIndex, updatedFieldLength);

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
          encodedLengths: previousEncodedLengths,
          data: data
        });
      }
    }

    {
      // Compute start index for the splice
      uint256 start = startWithinField;
      unchecked {
        // (safe because it's a few uint40 values, which can't overflow uint48)
        for (uint8 i; i < dynamicFieldIndex; i++) {
          start += previousEncodedLengths.atIndex(i);
        }
      }

      // Emit event to notify offchain indexers
      emit IStoreEvents.Store_SpliceDynamicData({
        tableId: tableId,
        keyTuple: keyTuple,
        dynamicFieldIndex: dynamicFieldIndex,
        start: uint48(start),
        deleteCount: deleteCount,
        encodedLengths: updatedEncodedLengths,
        data: data
      });
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
          encodedLengths: updatedEncodedLengths,
          data: data
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
   * @notice Get full static data for the given table ID and key tuple, with the given length in bytes.
   * @param tableId The ID of the table to get the static data from.
   * @param keyTuple An array representing the composite key for the record.
   * @param length The length of the static data to retrieve.
   * @return The full static data of the specified length.
   */
  function _getStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint256 length
  ) internal view returns (bytes memory) {
    if (length == 0) return "";

    // Load the data from storage
    uint256 location = _getStaticDataLocation(tableId, keyTuple);
    return Storage.load({ storagePointer: location, offset: 0, length: length });
  }

  /**
   * @notice Get a single static field from the given table ID and key tuple, with the given value field layout.
   * @param tableId The ID of the table to get the static field from.
   * @param keyTuple An array representing the composite key for the record.
   * @param fieldIndex The index of the field to get.
   * @param fieldLayout The field layout for the record.
   * @return The static field data as dynamic bytes in the size of the field.
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
        storagePointer: _getStaticDataLocation(tableId, keyTuple),
        offset: _getStaticDataOffset(fieldLayout, fieldIndex),
        length: fieldLayout.atIndex(fieldIndex)
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
   * @notice Compute the storage location based on table ID and key tuple.
   * @param tableId The ID of the table.
   * @param keyTuple An array representing the composite key for the record.
   * @return The computed storage location based on table ID and key tuple.
   */
  function _getStaticDataLocation(ResourceId tableId, bytes32[] memory keyTuple) internal pure returns (uint256) {
    return uint256(SLOT ^ keccak256(abi.encodePacked(tableId, keyTuple)));
  }

  /**
   * @notice Compute the storage location based on table ID and a single key.
   * @param tableId The ID of the table.
   * @param key The single key for the record.
   * @return The computed storage location based on table ID and key.
   */
  function _getStaticDataLocation(ResourceId tableId, bytes32 key) internal pure returns (uint256) {
    // keccak256(abi.encodePacked(tableId, key)) is equivalent to keccak256(abi.encodePacked(tableId, [key]))
    return uint256(SLOT ^ keccak256(abi.encodePacked(tableId, key)));
  }

  /**
   * @notice Get storage offset for the given value field layout and index.
   * @param fieldLayout The field layout for the record.
   * @param fieldIndex The index of the field to get the offset for.
   * @return The storage offset for the specified field layout and index.
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
   * @notice Compute the storage location based on table ID, key tuple, and dynamic field index.
   * @param tableId The ID of the table.
   * @param keyTuple An array representing the composite key for the record.
   * @param dynamicFieldIndex The index of the dynamic field, relative to the start of the dynamic fields.
   * (Dynamic field index = field index - number of static fields)
   * @return The computed storage location based on table ID, key tuple, and dynamic field index.
   */
  function _getDynamicDataLocation(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) internal pure returns (uint256) {
    return uint256(DYNAMIC_DATA_SLOT ^ bytes1(dynamicFieldIndex) ^ keccak256(abi.encodePacked(tableId, keyTuple)));
  }

  /**
   * @notice Compute the storage location for the length of the dynamic data based on table ID and key tuple.
   * @param tableId The ID of the table.
   * @param keyTuple An array representing the composite key for the record.
   * @return The computed storage location for the length of the dynamic data based on table ID and key tuple.
   */
  function _getDynamicDataLengthLocation(
    ResourceId tableId,
    bytes32[] memory keyTuple
  ) internal pure returns (uint256) {
    return uint256(DYNAMIC_DATA_LENGTH_SLOT ^ keccak256(abi.encodePacked(tableId, keyTuple)));
  }

  /**
   * @notice Load the encoded dynamic data length from storage for the given table ID and key tuple.
   * @param tableId The ID of the table.
   * @param keyTuple An array representing the composite key for the record.
   * @return The loaded encoded dynamic data length from storage for the given table ID and key tuple.
   */
  function _loadEncodedDynamicDataLength(
    ResourceId tableId,
    bytes32[] memory keyTuple
  ) internal view returns (EncodedLengths) {
    // Load dynamic data length from storage
    return EncodedLengths.wrap(Storage.load({ storagePointer: _getDynamicDataLengthLocation(tableId, keyTuple) }));
  }
}
