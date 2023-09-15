// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { STORE_VERSION } from "./version.sol";
import { Bytes } from "./Bytes.sol";
import { Storage } from "./Storage.sol";
import { Memory } from "./Memory.sol";
import { FieldLayout, FieldLayoutLib } from "./FieldLayout.sol";
import { Schema, SchemaLib } from "./Schema.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { Slice, SliceLib } from "./Slice.sol";
import { StoreHooks, Tables, StoreHooksTableId } from "./codegen/Tables.sol";
import { IStoreErrors } from "./IStoreErrors.sol";
import { IStoreHook } from "./IStoreHook.sol";
import { StoreSwitch } from "./StoreSwitch.sol";
import { Hook, HookLib } from "./Hook.sol";
import { StoreHookLib, StoreHookType } from "./StoreHook.sol";

library StoreCore {
  event HelloStore(bytes32 indexed version);
  event StoreSetRecord(bytes32 tableId, bytes32[] keyTuple, bytes data);
  event StoreSetField(bytes32 tableId, bytes32[] keyTuple, uint8 fieldIndex, bytes data);
  event StoreDeleteRecord(bytes32 tableId, bytes32[] keyTuple);
  event StoreEphemeralRecord(bytes32 tableId, bytes32[] keyTuple, bytes data);

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
  }

  /************************************************************************
   *
   *    SCHEMA
   *
   ************************************************************************/

  /**
   * Get the field layout for the given tableId
   */
  function getFieldLayout(bytes32 tableId) internal view returns (FieldLayout fieldLayout) {
    fieldLayout = FieldLayout.wrap(Tables.getFieldLayout(tableId));
    if (fieldLayout.isEmpty()) {
      revert IStoreErrors.StoreCore_TableNotFound(tableId, string(abi.encodePacked(tableId)));
    }
  }

  /**
   * Get the key schema for the given tableId
   */
  function getKeySchema(bytes32 tableId) internal view returns (Schema keySchema) {
    keySchema = Schema.wrap(Tables.getKeySchema(tableId));
    // key schemas can be empty for singleton tables, so we can't depend on key schema for table check
    if (!hasTable(tableId)) {
      revert IStoreErrors.StoreCore_TableNotFound(tableId, string(abi.encodePacked(tableId)));
    }
  }

  /**
   * Get the schema for the given tableId
   */
  function getValueSchema(bytes32 tableId) internal view returns (Schema valueSchema) {
    valueSchema = Schema.wrap(Tables.getValueSchema(tableId));
    if (valueSchema.isEmpty()) {
      revert IStoreErrors.StoreCore_TableNotFound(tableId, string(abi.encodePacked(tableId)));
    }
  }

  /**
   * Check if a table with the given tableId exists
   */
  function hasTable(bytes32 tableId) internal view returns (bool) {
    return Tables.getFieldLayout(tableId) != bytes32(0);
  }

  /**
   * Register a new table the given config
   */
  function registerTable(
    bytes32 tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] memory keyNames,
    string[] memory fieldNames
  ) internal {
    // Verify the field layout is valid
    fieldLayout.validate({ allowEmpty: false });
    // Verify the schema is valid
    keySchema.validate({ allowEmpty: true });
    valueSchema.validate({ allowEmpty: false });

    // Verify the number of key names matches the number of key schema types
    if (keyNames.length != keySchema.numFields()) {
      revert IStoreErrors.StoreCore_InvalidKeyNamesLength(keySchema.numFields(), keyNames.length);
    }

    // Verify the number of value names
    if (fieldNames.length != fieldLayout.numFields()) {
      revert IStoreErrors.StoreCore_InvalidFieldNamesLength(fieldLayout.numFields(), fieldNames.length);
    }
    // Verify the number of value schema types
    if (valueSchema.numFields() != fieldLayout.numFields()) {
      revert IStoreErrors.StoreCore_InvalidValueSchemaLength(fieldLayout.numFields(), valueSchema.numFields());
    }

    // Verify the field layout doesn't exist yet
    if (hasTable(tableId)) {
      revert IStoreErrors.StoreCore_TableAlreadyExists(tableId, string(abi.encodePacked(tableId)));
    }

    // Register the table metadata
    Tables.set(
      tableId,
      FieldLayout.unwrap(fieldLayout),
      Schema.unwrap(keySchema),
      Schema.unwrap(valueSchema),
      abi.encode(keyNames),
      abi.encode(fieldNames)
    );
  }

  /************************************************************************
   *
   *    REGISTER HOOKS
   *
   ************************************************************************/

  /*
   * Register hooks to be called when a record or field is set or deleted
   */
  function registerStoreHook(bytes32 tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) internal {
    StoreHooks.push(tableId, Hook.unwrap(StoreHookLib.encode(hookAddress, enabledHooksBitmap)));
  }

  /**
   * Unregister a hook from the given tableId
   */
  function unregisterStoreHook(bytes32 tableId, IStoreHook hookAddress) internal {
    HookLib.filterListByAddress(StoreHooksTableId, tableId, address(hookAddress));
  }

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  /**
   * Set full data record for the given tableId and key tuple and field layout
   */
  function setRecord(bytes32 tableId, bytes32[] memory keyTuple, bytes memory data, FieldLayout fieldLayout) internal {
    // verify the value has the correct length for the table (based on the table's field layout)
    // to prevent invalid data from being stored

    // Verify static data length + dynamic data length matches the given data
    (uint256 staticLength, PackedCounter dynamicLength) = StoreCoreInternal._validateDataLength(fieldLayout, data);

    // Emit event to notify indexers
    emit StoreSetRecord(tableId, keyTuple, data);

    // Call onBeforeSetRecord hooks (before actually modifying the state, so observers have access to the previous state if needed)
    bytes21[] memory hooks = StoreHooks.get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.BEFORE_SET_RECORD))) {
        IStoreHook(hook.getAddress()).onBeforeSetRecord(tableId, keyTuple, data, fieldLayout);
      }
    }

    // Store the static data at the static data location
    uint256 staticDataLocation = StoreCoreInternal._getStaticDataLocation(tableId, keyTuple);
    uint256 memoryPointer = Memory.dataPointer(data);
    Storage.store({
      storagePointer: staticDataLocation,
      offset: 0,
      memoryPointer: memoryPointer,
      length: staticLength
    });
    memoryPointer += staticLength + 32; // move the memory pointer to the start of the dynamic data (skip the encoded dynamic length)

    // Set the dynamic data if there are dynamic fields
    if (fieldLayout.numDynamicFields() > 0) {
      // Store the dynamic data length at the dynamic data length location
      uint256 dynamicDataLengthLocation = StoreCoreInternal._getDynamicDataLengthLocation(tableId, keyTuple);
      Storage.store({ storagePointer: dynamicDataLengthLocation, data: dynamicLength.unwrap() });

      // For every dynamic element, slice off the dynamic data and store it at the dynamic location
      uint256 dynamicDataLocation;
      uint256 dynamicDataLength;
      for (uint8 i; i < fieldLayout.numDynamicFields(); ) {
        dynamicDataLocation = StoreCoreInternal._getDynamicDataLocation(tableId, keyTuple, i);
        dynamicDataLength = dynamicLength.atIndex(i);
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
      if (hook.isEnabled(uint8(StoreHookType.AFTER_SET_RECORD))) {
        IStoreHook(hook.getAddress()).onAfterSetRecord(tableId, keyTuple, data, fieldLayout);
      }
    }
  }

  /**
   * Set data for a field in a table with the given tableId, key tuple and value field layout
   */
  function setField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) internal {
    // Emit event to notify indexers
    emit StoreSetField(tableId, keyTuple, schemaIndex, data);

    // Call onBeforeSetField hooks (before modifying the state)
    bytes21[] memory hooks = StoreHooks.get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.BEFORE_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onBeforeSetField(tableId, keyTuple, schemaIndex, data, fieldLayout);
      }
    }

    if (schemaIndex < fieldLayout.numStaticFields()) {
      StoreCoreInternal._setStaticField(tableId, keyTuple, fieldLayout, schemaIndex, data);
    } else {
      StoreCoreInternal._setDynamicField(tableId, keyTuple, fieldLayout, schemaIndex, data);
    }

    // Call onAfterSetField hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.AFTER_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onAfterSetField(tableId, keyTuple, schemaIndex, data, fieldLayout);
      }
    }
  }

  /**
   * Delete a record for the given tableId, key tuple and value field layout
   */
  function deleteRecord(bytes32 tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) internal {
    // Emit event to notify indexers
    emit StoreDeleteRecord(tableId, keyTuple);

    // Call onBeforeDeleteRecord hooks (before actually modifying the state, so observers have access to the previous state if needed)
    bytes21[] memory hooks = StoreHooks.get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.BEFORE_DELETE_RECORD))) {
        IStoreHook(hook.getAddress()).onBeforeDeleteRecord(tableId, keyTuple, fieldLayout);
      }
    }

    // Delete static data
    uint256 staticDataLocation = StoreCoreInternal._getStaticDataLocation(tableId, keyTuple);
    Storage.store({ storagePointer: staticDataLocation, offset: 0, data: new bytes(fieldLayout.staticDataLength()) });

    // If there are dynamic fields, delete the dynamic data length
    if (fieldLayout.numDynamicFields() > 0) {
      uint256 dynamicDataLengthLocation = StoreCoreInternal._getDynamicDataLengthLocation(tableId, keyTuple);
      Storage.store({ storagePointer: dynamicDataLengthLocation, data: bytes32(0) });
    }

    // Call onAfterDeleteRecord hooks
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.AFTER_DELETE_RECORD))) {
        IStoreHook(hook.getAddress()).onAfterDeleteRecord(tableId, keyTuple, fieldLayout);
      }
    }
  }

  /**
   * Push data to a field in a table with the given tableId, keyTuple tuple and value field layout
   */
  function pushToField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    bytes memory dataToPush,
    FieldLayout fieldLayout
  ) internal {
    if (schemaIndex < fieldLayout.numStaticFields()) {
      revert IStoreErrors.StoreCore_NotDynamicField();
    }

    // TODO add push-specific event and hook to avoid the storage read? (https://github.com/latticexyz/mud/issues/444)
    bytes memory fullData = abi.encodePacked(
      StoreCoreInternal._getDynamicField(tableId, keyTuple, schemaIndex, fieldLayout),
      dataToPush
    );

    // Emit event to notify indexers
    emit StoreSetField(tableId, keyTuple, schemaIndex, fullData);

    // Call onBeforeSetField hooks (before modifying the state)
    bytes21[] memory hooks = StoreHooks.get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.BEFORE_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onBeforeSetField(tableId, keyTuple, schemaIndex, fullData, fieldLayout);
      }
    }

    StoreCoreInternal._pushToDynamicField(tableId, keyTuple, fieldLayout, schemaIndex, dataToPush);

    // Call onAfterSetField hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.AFTER_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onAfterSetField(tableId, keyTuple, schemaIndex, fullData, fieldLayout);
      }
    }
  }

  /**
   * Pop data from a field in a table with the given tableId, key tuple and value field layout
   */
  function popFromField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    uint256 byteLengthToPop,
    FieldLayout fieldLayout
  ) internal {
    if (schemaIndex < fieldLayout.numStaticFields()) {
      revert IStoreErrors.StoreCore_NotDynamicField();
    }

    // TODO add pop-specific event and hook to avoid the storage read? (https://github.com/latticexyz/mud/issues/444)
    bytes memory fullData;
    {
      bytes memory oldData = StoreCoreInternal._getDynamicField(tableId, keyTuple, schemaIndex, fieldLayout);
      fullData = SliceLib.getSubslice(oldData, 0, oldData.length - byteLengthToPop).toBytes();
    }

    // Emit event to notify indexers
    emit StoreSetField(tableId, keyTuple, schemaIndex, fullData);

    // Call onBeforeSetField hooks (before modifying the state)
    bytes21[] memory hooks = StoreHooks.get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.BEFORE_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onBeforeSetField(tableId, keyTuple, schemaIndex, fullData, fieldLayout);
      }
    }

    StoreCoreInternal._popFromDynamicField(tableId, keyTuple, fieldLayout, schemaIndex, byteLengthToPop);

    // Call onAfterSetField hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.AFTER_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onAfterSetField(tableId, keyTuple, schemaIndex, fullData, fieldLayout);
      }
    }
  }

  /**
   * Update data in a field in a table with the given tableId, key tuple and value field layout
   */
  function updateInField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes memory dataToSet,
    FieldLayout fieldLayout
  ) internal {
    if (schemaIndex < fieldLayout.numStaticFields()) {
      revert IStoreErrors.StoreCore_NotDynamicField();
    }
    // index must be checked because it could be arbitrarily large
    // (but dataToSet.length can be unchecked - it won't overflow into another slot due to gas costs and hashed slots)
    if (startByteIndex > type(uint40).max) {
      revert IStoreErrors.StoreCore_DataIndexOverflow(type(uint40).max, startByteIndex);
    }

    // TODO add setItem-specific event and hook to avoid the storage read? (https://github.com/latticexyz/mud/issues/444)
    bytes memory fullData;
    {
      bytes memory oldData = StoreCoreInternal._getDynamicField(tableId, keyTuple, schemaIndex, fieldLayout);
      fullData = abi.encodePacked(
        SliceLib.getSubslice(oldData, 0, startByteIndex).toBytes(),
        dataToSet,
        SliceLib.getSubslice(oldData, startByteIndex + dataToSet.length, oldData.length).toBytes()
      );
    }

    // Emit event to notify indexers
    emit StoreSetField(tableId, keyTuple, schemaIndex, fullData);

    // Call onBeforeSetField hooks (before modifying the state)
    bytes21[] memory hooks = StoreHooks.get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.BEFORE_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onBeforeSetField(tableId, keyTuple, schemaIndex, fullData, fieldLayout);
      }
    }

    StoreCoreInternal._setDynamicFieldItem(tableId, keyTuple, fieldLayout, schemaIndex, startByteIndex, dataToSet);

    // Call onAfterSetField hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.AFTER_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onAfterSetField(tableId, keyTuple, schemaIndex, fullData, fieldLayout);
      }
    }
  }

  /************************************************************************
   *
   *    EPHEMERAL SET DATA
   *
   ************************************************************************/

  /**
   * Emit the ephemeral event without modifying storage for the full data of the given tableId and key tuple
   */
  function emitEphemeralRecord(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    bytes memory data,
    FieldLayout fieldLayout
  ) internal {
    // Verify static data length + dynamic data length matches the given data
    StoreCoreInternal._validateDataLength(fieldLayout, data);

    // Emit event to notify indexers
    emit StoreEphemeralRecord(tableId, keyTuple, data);
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/

  /**
   * Get full record (all fields, static and dynamic data) for the given tableId and key tuple, with the given value field layout
   */
  function getRecord(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory) {
    // Get the static data length
    uint256 staticLength = fieldLayout.staticDataLength();
    uint256 outputLength = staticLength;

    // Load the dynamic data length if there are dynamic fields
    PackedCounter dynamicDataLength;
    uint256 numDynamicFields = fieldLayout.numDynamicFields();
    if (numDynamicFields > 0) {
      dynamicDataLength = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple);
      // TODO should total output include dynamic data length even if it's 0?
      if (dynamicDataLength.total() > 0) {
        outputLength += 32 + dynamicDataLength.total(); // encoded length + data
      }
    }

    // Allocate length for the full packed data (static and dynamic)
    bytes memory data = new bytes(outputLength);
    uint256 memoryPointer = Memory.dataPointer(data);

    // Load the static data from storage
    StoreCoreInternal._getStaticData(tableId, keyTuple, staticLength, memoryPointer);

    // Early return if there are no dynamic fields
    if (dynamicDataLength.total() == 0) return data;
    // Advance memoryPointer to the dynamic data section
    memoryPointer += staticLength;

    // Append the encoded dynamic length
    assembly {
      mstore(memoryPointer, dynamicDataLength)
    }
    // Advance memoryPointer by the length of `dynamicDataLength` (1 word)
    memoryPointer += 0x20;

    // Append dynamic data
    for (uint8 i; i < numDynamicFields; i++) {
      uint256 dynamicDataLocation = StoreCoreInternal._getDynamicDataLocation(tableId, keyTuple, i);
      uint256 length = dynamicDataLength.atIndex(i);
      Storage.load({ storagePointer: dynamicDataLocation, length: length, offset: 0, memoryPointer: memoryPointer });
      // Advance memoryPointer by the length of this dynamic field
      memoryPointer += length;
    }

    // Return the packed data
    return data;
  }

  /**
   * Get a single field from the given tableId and key tuple, with the given value field layout
   */
  function getField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory) {
    if (schemaIndex < fieldLayout.numStaticFields()) {
      return StoreCoreInternal._getStaticField(tableId, keyTuple, schemaIndex, fieldLayout);
    } else {
      return StoreCoreInternal._getDynamicField(tableId, keyTuple, schemaIndex, fieldLayout);
    }
  }

  /**
   * Get the byte length of a single field from the given tableId and key tuple, with the given value field layout
   */
  function getFieldLength(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) internal view returns (uint256) {
    uint8 numStaticFields = uint8(fieldLayout.numStaticFields());
    if (schemaIndex < numStaticFields) {
      return fieldLayout.atIndex(schemaIndex);
    } else {
      // Get the length and storage location of the dynamic field
      uint8 dynamicFieldLayoutIndex = schemaIndex - numStaticFields;
      return StoreCoreInternal._loadEncodedDynamicDataLength(tableId, keyTuple).atIndex(dynamicFieldLayoutIndex);
    }
  }

  /**
   * Get a byte slice (including start, excluding end) of a single dynamic field from the given tableId and key tuple, with the given value field layout.
   * The slice is unchecked and will return invalid data if `start`:`end` overflow.
   */
  function getFieldSlice(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    FieldLayout fieldLayout,
    uint256 start,
    uint256 end
  ) internal view returns (bytes memory) {
    uint8 numStaticFields = uint8(fieldLayout.numStaticFields());
    if (schemaIndex < fieldLayout.numStaticFields()) {
      revert IStoreErrors.StoreCore_NotDynamicField();
    }

    // Get the length and storage location of the dynamic field
    uint8 dynamicSchemaIndex = schemaIndex - numStaticFields;
    uint256 location = StoreCoreInternal._getDynamicDataLocation(tableId, keyTuple, dynamicSchemaIndex);

    return Storage.load({ storagePointer: location, length: end - start, offset: start });
  }
}

library StoreCoreInternal {
  bytes32 internal constant SLOT = keccak256("mud.store");

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  function _setStaticField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout,
    uint8 schemaIndex,
    bytes memory data
  ) internal {
    // verify the value has the correct length for the field
    uint256 staticByteLength = fieldLayout.atIndex(schemaIndex);
    if (staticByteLength != data.length) {
      revert IStoreErrors.StoreCore_InvalidDataLength(staticByteLength, data.length);
    }

    // Store the provided value in storage
    uint256 location = _getStaticDataLocation(tableId, keyTuple);
    uint256 offset = _getStaticDataOffset(fieldLayout, schemaIndex);
    Storage.store({ storagePointer: location, offset: offset, data: data });
  }

  function _setDynamicField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout,
    uint8 schemaIndex,
    bytes memory data
  ) internal {
    uint8 dynamicSchemaIndex = schemaIndex - uint8(fieldLayout.numStaticFields());

    // Update the dynamic data length
    _setDynamicDataLengthAtIndex(tableId, keyTuple, dynamicSchemaIndex, data.length);

    // Store the provided value in storage
    uint256 dynamicDataLocation = _getDynamicDataLocation(tableId, keyTuple, dynamicSchemaIndex);
    Storage.store({ storagePointer: dynamicDataLocation, offset: 0, data: data });
  }

  function _pushToDynamicField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout,
    uint8 schemaIndex,
    bytes memory dataToPush
  ) internal {
    uint8 dynamicSchemaIndex = schemaIndex - uint8(fieldLayout.numStaticFields());

    // Load dynamic data length from storage
    uint256 dynamicDataLengthSlot = _getDynamicDataLengthLocation(tableId, keyTuple);
    PackedCounter encodedLengths = PackedCounter.wrap(Storage.load({ storagePointer: dynamicDataLengthSlot }));

    // Update the encoded length
    uint256 oldFieldLength = encodedLengths.atIndex(dynamicSchemaIndex);
    encodedLengths = encodedLengths.setAtIndex(dynamicSchemaIndex, oldFieldLength + dataToPush.length);

    // Set the new length
    Storage.store({ storagePointer: dynamicDataLengthSlot, data: encodedLengths.unwrap() });

    // Append `dataToPush` to the end of the data in storage
    _setPartialDynamicData(tableId, keyTuple, dynamicSchemaIndex, oldFieldLength, dataToPush);
  }

  function _popFromDynamicField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout,
    uint8 schemaIndex,
    uint256 byteLengthToPop
  ) internal {
    uint8 dynamicSchemaIndex = schemaIndex - uint8(fieldLayout.numStaticFields());

    // Load dynamic data length from storage
    uint256 dynamicDataLengthSlot = _getDynamicDataLengthLocation(tableId, keyTuple);
    PackedCounter encodedLengths = PackedCounter.wrap(Storage.load({ storagePointer: dynamicDataLengthSlot }));

    // Update the encoded length
    uint256 oldFieldLength = encodedLengths.atIndex(dynamicSchemaIndex);
    encodedLengths = encodedLengths.setAtIndex(dynamicSchemaIndex, oldFieldLength - byteLengthToPop);

    // Set the new length
    Storage.store({ storagePointer: dynamicDataLengthSlot, data: encodedLengths.unwrap() });

    // Data can be left unchanged, push/set do not assume storage to be 0s
  }

  // startOffset is measured in bytes
  function _setDynamicFieldItem(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes memory dataToSet
  ) internal {
    uint8 dynamicSchemaIndex = schemaIndex - uint8(fieldLayout.numStaticFields());

    // Set `dataToSet` at the given index
    _setPartialDynamicData(tableId, keyTuple, dynamicSchemaIndex, startByteIndex, dataToSet);
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/

  /**
   * Get full static data for the given tableId and key tuple, with the given static length
   */
  function _getStaticData(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint256 length,
    uint256 memoryPointer
  ) internal view {
    if (length == 0) return;

    // Load the data from storage
    uint256 location = _getStaticDataLocation(tableId, keyTuple);
    Storage.load({ storagePointer: location, length: length, offset: 0, memoryPointer: memoryPointer });
  }

  /**
   * Get a single static field from the given tableId and key tuple, with the given value field layout
   */
  function _getStaticField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory) {
    // Get the length, storage location and offset of the static field
    uint256 staticByteLength = fieldLayout.atIndex(schemaIndex);
    uint256 location = _getStaticDataLocation(tableId, keyTuple);
    uint256 offset = _getStaticDataOffset(fieldLayout, schemaIndex);

    // Load the data from storage

    return Storage.load({ storagePointer: location, length: staticByteLength, offset: offset });
  }

  /**
   * Get a single dynamic field from the given tableId and key tuple, with the given value field layout
   */
  function _getDynamicField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory) {
    // Get the length and storage location of the dynamic field
    uint8 dynamicSchemaIndex = schemaIndex - uint8(fieldLayout.numStaticFields());
    uint256 location = _getDynamicDataLocation(tableId, keyTuple, dynamicSchemaIndex);
    uint256 dataLength = _loadEncodedDynamicDataLength(tableId, keyTuple).atIndex(dynamicSchemaIndex);

    return Storage.load({ storagePointer: location, length: dataLength, offset: 0 });
  }

  /************************************************************************
   *
   *    HELPER FUNCTIONS
   *
   ************************************************************************/

  /**
   * Verify static data length + dynamic data length matches the given data
   * Returns the static and dynamic lengths
   */
  function _validateDataLength(
    FieldLayout fieldLayout,
    bytes memory data
  ) internal pure returns (uint256 staticLength, PackedCounter dynamicLength) {
    staticLength = fieldLayout.staticDataLength();
    uint256 expectedLength = staticLength;
    dynamicLength;
    if (fieldLayout.numDynamicFields() > 0) {
      // Dynamic length is encoded at the start of the dynamic length blob
      dynamicLength = PackedCounter.wrap(Bytes.slice32(data, staticLength));
      expectedLength += 32 + dynamicLength.total(); // encoded length + data
    }

    if (expectedLength != data.length) {
      revert IStoreErrors.StoreCore_InvalidDataLength(expectedLength, data.length);
    }
  }

  /////////////////////////////////////////////////////////////////////////
  //    STATIC DATA
  /////////////////////////////////////////////////////////////////////////

  /**
   * Compute the storage location based on tableId id and index tuple
   */
  function _getStaticDataLocation(bytes32 tableId, bytes32[] memory keyTuple) internal pure returns (uint256) {
    return uint256(keccak256(abi.encode(SLOT, tableId, keyTuple)));
  }

  /**
   * Get storage offset for the given value field layout and (static length) index
   */
  function _getStaticDataOffset(FieldLayout fieldLayout, uint8 schemaIndex) internal pure returns (uint256) {
    uint256 offset = 0;
    for (uint256 i; i < schemaIndex; i++) {
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
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex
  ) internal pure returns (uint256) {
    return uint256(keccak256(abi.encode(SLOT, tableId, keyTuple, schemaIndex)));
  }

  /**
   * Compute the storage location for the length of the dynamic data
   */
  function _getDynamicDataLengthLocation(bytes32 tableId, bytes32[] memory keyTuple) internal pure returns (uint256) {
    return uint256(keccak256(abi.encode(SLOT, tableId, keyTuple, "length")));
  }

  /**
   * Get the length of the dynamic data for the given value field layout and index
   */
  function _loadEncodedDynamicDataLength(
    bytes32 tableId,
    bytes32[] memory keyTuple
  ) internal view returns (PackedCounter) {
    // Load dynamic data length from storage
    uint256 dynamicDataLengthSlot = _getDynamicDataLengthLocation(tableId, keyTuple);
    return PackedCounter.wrap(Storage.load({ storagePointer: dynamicDataLengthSlot }));
  }

  /**
   * Set the length of the dynamic data (in bytes) for the given value field layout and index
   */
  function _setDynamicDataLengthAtIndex(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicSchemaIndex, // schemaIndex - numStaticFields
    uint256 newLengthAtIndex
  ) internal {
    // Load dynamic data length from storage
    uint256 dynamicDataLengthSlot = _getDynamicDataLengthLocation(tableId, keyTuple);
    PackedCounter encodedLengths = PackedCounter.wrap(Storage.load({ storagePointer: dynamicDataLengthSlot }));

    // Update the encoded lengths
    encodedLengths = encodedLengths.setAtIndex(dynamicSchemaIndex, newLengthAtIndex);

    // Set the new lengths
    Storage.store({ storagePointer: dynamicDataLengthSlot, data: encodedLengths.unwrap() });
  }

  /**
   * Modify a part of the dynamic field's data (without changing the field's length)
   */
  function _setPartialDynamicData(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicSchemaIndex,
    uint256 startByteIndex,
    bytes memory partialData
  ) internal {
    uint256 dynamicDataLocation = _getDynamicDataLocation(tableId, keyTuple, dynamicSchemaIndex);
    // start index is in bytes, whereas storage slots are in 32-byte words
    dynamicDataLocation += startByteIndex / 32;
    // partial storage slot offset (there is no inherent offset, as each dynamic field starts at its own storage slot)
    uint256 offset = startByteIndex % 32;
    Storage.store({ storagePointer: dynamicDataLocation, offset: offset, data: partialData });
  }
}
