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
import { StoreHooks, Tables, StoreHooksTableId } from "./codegen/index.sol";
import { IStoreErrors } from "./IStoreErrors.sol";
import { IStoreHook } from "./IStoreHook.sol";
import { StoreSwitch } from "./StoreSwitch.sol";
import { Hook, HookLib } from "./Hook.sol";
import { StoreHookLib, StoreHookType } from "./StoreHook.sol";

library StoreCore {
  event HelloStore(bytes32 indexed version);
  event StoreSetRecord(
    bytes32 indexed tableId,
    bytes32[] keyTuple,
    bytes staticData,
    bytes32 encodedLengths,
    bytes dynamicData
  );
  event StoreSpliceStaticData(
    bytes32 indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes data
  );
  event StoreSpliceDynamicData(
    bytes32 indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes data,
    bytes32 encodedLengths
  );
  event StoreDeleteRecord(bytes32 indexed tableId, bytes32[] keyTuple);
  event StoreEphemeralRecord(
    bytes32 indexed tableId,
    bytes32[] keyTuple,
    bytes staticData,
    bytes32 encodedLengths,
    bytes dynamicData
  );

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
    fieldLayout = FieldLayout.wrap(Tables._getFieldLayout(tableId));
    if (fieldLayout.isEmpty()) {
      revert IStoreErrors.StoreCore_TableNotFound(tableId, string(abi.encodePacked(tableId)));
    }
  }

  /**
   * Get the key schema for the given tableId
   */
  function getKeySchema(bytes32 tableId) internal view returns (Schema keySchema) {
    keySchema = Schema.wrap(Tables._getKeySchema(tableId));
    // key schemas can be empty for singleton tables, so we can't depend on key schema for table check
    if (!hasTable(tableId)) {
      revert IStoreErrors.StoreCore_TableNotFound(tableId, string(abi.encodePacked(tableId)));
    }
  }

  /**
   * Get the schema for the given tableId
   */
  function getValueSchema(bytes32 tableId) internal view returns (Schema valueSchema) {
    valueSchema = Schema.wrap(Tables._getValueSchema(tableId));
    if (valueSchema.isEmpty()) {
      revert IStoreErrors.StoreCore_TableNotFound(tableId, string(abi.encodePacked(tableId)));
    }
  }

  /**
   * Check if a table with the given tableId exists
   */
  function hasTable(bytes32 tableId) internal view returns (bool) {
    return Tables._getFieldLayout(tableId) != bytes32(0);
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
    Tables._set(
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
  function setRecord(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) internal {
    // verify the value has the correct length for the tableId (based on the tableId's field layout)
    // to prevent invalid data from being stored

    // Verify static data length + dynamic data length matches the given data
    StoreCoreInternal._validateDataLength(fieldLayout, staticData, encodedLengths, dynamicData);

    // Emit event to notify indexers
    emit StoreSetRecord(tableId, keyTuple, staticData, encodedLengths.unwrap(), dynamicData);

    // Call onBeforeSetRecord hooks (before actually modifying the state, so observers have access to the previous state if needed)
    bytes21[] memory hooks = StoreHooks._get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.BEFORE_SET_RECORD))) {
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
      if (hook.isEnabled(uint8(StoreHookType.AFTER_SET_RECORD))) {
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
   * Set data for a field in a table with the given tableId, key tuple and value field layout
   */
  function setField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) internal {
    // Call onBeforeSetField hooks (before modifying the state)
    bytes21[] memory hooks = StoreHooks._get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.BEFORE_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onBeforeSetField(tableId, keyTuple, fieldIndex, data, fieldLayout);
      }
    }

    if (fieldIndex < fieldLayout.numStaticFields()) {
      StoreCoreInternal._setStaticField(tableId, keyTuple, fieldLayout, fieldIndex, data);
    } else {
      StoreCoreInternal._setDynamicField(tableId, keyTuple, fieldLayout, fieldIndex, data);
    }

    // Call onAfterSetField hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.AFTER_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onAfterSetField(tableId, keyTuple, fieldIndex, data, fieldLayout);
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
    bytes21[] memory hooks = StoreHooks._get(tableId);
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
    uint8 fieldIndex,
    bytes memory dataToPush,
    FieldLayout fieldLayout
  ) internal {
    if (fieldIndex < fieldLayout.numStaticFields()) {
      revert IStoreErrors.StoreCore_NotDynamicField();
    }

    // TODO add push-specific hook to avoid the storage read? (https://github.com/latticexyz/mud/issues/444)
    bytes memory fullData = abi.encodePacked(
      getDynamicField(tableId, keyTuple, fieldIndex - uint8(fieldLayout.numStaticFields())),
      dataToPush
    );

    // Call onBeforeSetField hooks (before modifying the state)
    bytes21[] memory hooks = StoreHooks._get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.BEFORE_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onBeforeSetField(tableId, keyTuple, fieldIndex, fullData, fieldLayout);
      }
    }

    StoreCoreInternal._pushToDynamicField(tableId, keyTuple, fieldLayout, fieldIndex, dataToPush);

    // Call onAfterSetField hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.AFTER_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onAfterSetField(tableId, keyTuple, fieldIndex, fullData, fieldLayout);
      }
    }
  }

  /**
   * Pop data from a field in a table with the given tableId, key tuple and value field layout
   */
  function popFromField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    uint256 byteLengthToPop,
    FieldLayout fieldLayout
  ) internal {
    if (fieldIndex < fieldLayout.numStaticFields()) {
      revert IStoreErrors.StoreCore_NotDynamicField();
    }

    // TODO add pop-specific hook to avoid the storage read? (https://github.com/latticexyz/mud/issues/444)
    bytes memory fullData;
    {
      bytes memory oldData = getDynamicField(tableId, keyTuple, fieldIndex - uint8(fieldLayout.numStaticFields()));
      fullData = SliceLib.getSubslice(oldData, 0, oldData.length - byteLengthToPop).toBytes();
    }

    // Call onBeforeSetField hooks (before modifying the state)
    bytes21[] memory hooks = StoreHooks._get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.BEFORE_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onBeforeSetField(tableId, keyTuple, fieldIndex, fullData, fieldLayout);
      }
    }

    StoreCoreInternal._popFromDynamicField(tableId, keyTuple, fieldLayout, fieldIndex, byteLengthToPop);

    // Call onAfterSetField hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.AFTER_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onAfterSetField(tableId, keyTuple, fieldIndex, fullData, fieldLayout);
      }
    }
  }

  /**
   * Update data in a field in a table with the given tableId, key tuple and value field layout
   */
  function updateInField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    uint256 startByteIndex,
    bytes memory dataToSet,
    FieldLayout fieldLayout
  ) internal {
    if (fieldIndex < fieldLayout.numStaticFields()) {
      revert IStoreErrors.StoreCore_NotDynamicField();
    }

    // index must be checked because it could be arbitrarily large
    // (but dataToSet.length can be unchecked - it won't overflow into another slot due to gas costs and hashed slots)
    if (startByteIndex > type(uint40).max) {
      revert IStoreErrors.StoreCore_DataIndexOverflow(type(uint40).max, startByteIndex);
    }

    // TODO add setItem-specific hook to avoid the storage read? (https://github.com/latticexyz/mud/issues/444)
    bytes memory fullData;
    {
      bytes memory oldData = getDynamicField(tableId, keyTuple, fieldIndex - uint8(fieldLayout.numStaticFields()));
      fullData = abi.encodePacked(
        SliceLib.getSubslice(oldData, 0, startByteIndex).toBytes(),
        dataToSet,
        SliceLib.getSubslice(oldData, startByteIndex + dataToSet.length, oldData.length).toBytes()
      );
    }

    // Call onBeforeSetField hooks (before modifying the state)
    bytes21[] memory hooks = StoreHooks._get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.BEFORE_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onBeforeSetField(tableId, keyTuple, fieldIndex, fullData, fieldLayout);
      }
    }

    StoreCoreInternal._setDynamicFieldItem(tableId, keyTuple, fieldLayout, fieldIndex, startByteIndex, dataToSet);

    // Call onAfterSetField hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      Hook hook = Hook.wrap(hooks[i]);
      if (hook.isEnabled(uint8(StoreHookType.AFTER_SET_FIELD))) {
        IStoreHook(hook.getAddress()).onAfterSetField(tableId, keyTuple, fieldIndex, fullData, fieldLayout);
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
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) internal {
    // Verify static data length + dynamic data length matches the given data
    StoreCoreInternal._validateDataLength(fieldLayout, staticData, encodedLengths, dynamicData);

    // Emit event to notify indexers
    emit StoreEphemeralRecord(tableId, keyTuple, staticData, encodedLengths.unwrap(), dynamicData);
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
   * Get a single static field from the given tableId and key tuple, with the given value field layout.
   * Note: the field value is left-aligned in the returned bytes32, the rest of the word is not zeroed out.
   * Consumers are expected to truncate the returned value as needed.
   */
  function getStaticField(
    bytes32 tableId,
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
   * Get a single dynamic field from the given tableId and key tuple, with the given value field layout
   */
  function getDynamicField(
    bytes32 tableId,
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
   * Get the byte length of a single field from the given tableId and key tuple, with the given value field layout
   */
  function getFieldLength(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (uint256) {
    uint8 numStaticFields = uint8(fieldLayout.numStaticFields());
    if (fieldIndex < numStaticFields) {
      return fieldLayout.atIndex(fieldIndex);
    } else {
      // Get the length and storage location of the dynamic field
      uint8 dynamicFieldLayoutIndex = fieldIndex - numStaticFields;
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
    uint8 fieldIndex,
    FieldLayout fieldLayout,
    uint256 start,
    uint256 end
  ) internal view returns (bytes memory) {
    uint8 numStaticFields = uint8(fieldLayout.numStaticFields());
    if (fieldIndex < fieldLayout.numStaticFields()) {
      revert IStoreErrors.StoreCore_NotDynamicField();
    }

    // Get the length and storage location of the dynamic field
    uint8 dynamicSchemaIndex = fieldIndex - numStaticFields;
    uint256 location = StoreCoreInternal._getDynamicDataLocation(tableId, keyTuple, dynamicSchemaIndex);

    return Storage.load({ storagePointer: location, length: end - start, offset: start });
  }
}

library StoreCoreInternal {
  bytes32 internal constant SLOT = keccak256("mud.store");
  bytes32 internal constant DYNMAIC_DATA_SLOT = keccak256("mud.store.dynamicData");
  bytes32 internal constant DYNAMIC_DATA_LENGTH_SLOT = keccak256("mud.store.dynamicDataLength");

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  function _setStaticField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout,
    uint8 fieldIndex,
    bytes memory data
  ) internal {
    uint256 location = _getStaticDataLocation(tableId, keyTuple);
    uint256 offset = _getStaticDataOffset(fieldLayout, fieldIndex);

    Storage.store({ storagePointer: location, offset: offset, data: data });

    // Emit event to notify indexers
    emit StoreCore.StoreSpliceStaticData({
      tableId: tableId,
      keyTuple: keyTuple,
      start: uint48(offset),
      deleteCount: uint40(fieldLayout.atIndex(fieldIndex)),
      data: data
    });
  }

  function _setDynamicField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout,
    uint8 fieldIndex,
    bytes memory data
  ) internal {
    uint8 dynamicSchemaIndex = fieldIndex - uint8(fieldLayout.numStaticFields());

    // Load dynamic data length from storage
    uint256 dynamicSchemaLengthSlot = _getDynamicDataLengthLocation(tableId, keyTuple);
    PackedCounter encodedLengths = PackedCounter.wrap(Storage.load({ storagePointer: dynamicSchemaLengthSlot }));

    // Update the encoded length
    uint256 oldFieldLength = encodedLengths.atIndex(dynamicSchemaIndex);
    encodedLengths = encodedLengths.setAtIndex(dynamicSchemaIndex, data.length);

    // Set the new lengths
    Storage.store({ storagePointer: dynamicSchemaLengthSlot, data: encodedLengths.unwrap() });

    // Store the provided value in storage
    uint256 dynamicDataLocation = _getDynamicDataLocation(tableId, keyTuple, dynamicSchemaIndex);
    Storage.store({ storagePointer: dynamicDataLocation, offset: 0, data: data });

    // Compute start index for the splice event
    uint256 start;
    unchecked {
      // (safe because it's a few uint40 values, which can't overflow uint48)
      for (uint8 i; i < dynamicSchemaIndex; i++) {
        start += encodedLengths.atIndex(i);
      }
    }

    // Emit event to notify indexers
    emit StoreCore.StoreSpliceDynamicData({
      tableId: tableId,
      keyTuple: keyTuple,
      start: uint48(start),
      deleteCount: uint40(oldFieldLength),
      data: data,
      encodedLengths: encodedLengths.unwrap()
    });
  }

  function _pushToDynamicField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout,
    uint8 fieldIndex,
    bytes memory dataToPush
  ) internal {
    uint8 dynamicSchemaIndex = fieldIndex - uint8(fieldLayout.numStaticFields());

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

    // Compute start index for the splice event
    uint256 start = oldFieldLength;
    unchecked {
      // (safe because it's a few uint40 values, which can't overflow uint48)
      for (uint8 i; i < dynamicSchemaIndex; i++) {
        start += encodedLengths.atIndex(i);
      }
    }

    // Emit event to notify indexers
    emit StoreCore.StoreSpliceDynamicData({
      tableId: tableId,
      keyTuple: keyTuple,
      start: uint48(start),
      deleteCount: uint40(0),
      data: dataToPush,
      encodedLengths: encodedLengths.unwrap()
    });
  }

  function _popFromDynamicField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout,
    uint8 fieldIndex,
    uint256 byteLengthToPop
  ) internal {
    uint8 dynamicSchemaIndex = fieldIndex - uint8(fieldLayout.numStaticFields());

    // Load dynamic data length from storage
    uint256 dynamicDataLengthSlot = _getDynamicDataLengthLocation(tableId, keyTuple);
    PackedCounter encodedLengths = PackedCounter.wrap(Storage.load({ storagePointer: dynamicDataLengthSlot }));

    // Update the encoded length
    uint256 oldFieldLength = encodedLengths.atIndex(dynamicSchemaIndex);
    encodedLengths = encodedLengths.setAtIndex(dynamicSchemaIndex, oldFieldLength - byteLengthToPop);

    // Set the new length
    Storage.store({ storagePointer: dynamicDataLengthSlot, data: encodedLengths.unwrap() });

    // Data can be left unchanged, push/set do not assume storage to be 0s

    // Compute start index for the splice event
    uint256 start;
    unchecked {
      // (safe because it's a few uint40 values, which can't overflow uint48)
      start = oldFieldLength;
      for (uint8 i; i < dynamicSchemaIndex; i++) {
        start += encodedLengths.atIndex(i);
      }
      start -= byteLengthToPop;
    }

    // Emit event to notify indexers
    emit StoreCore.StoreSpliceDynamicData({
      tableId: tableId,
      keyTuple: keyTuple,
      start: uint48(start),
      deleteCount: uint40(byteLengthToPop),
      data: new bytes(0),
      encodedLengths: encodedLengths.unwrap()
    });
  }

  // startOffset is measured in bytes
  function _setDynamicFieldItem(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout,
    uint8 fieldIndex,
    uint256 startByteIndex,
    bytes memory dataToSet
  ) internal {
    uint8 dynamicSchemaIndex = fieldIndex - uint8(fieldLayout.numStaticFields());

    // Load dynamic data length from storage
    uint256 dynamicSchemaLengthSlot = _getDynamicDataLengthLocation(tableId, keyTuple);
    PackedCounter encodedLengths = PackedCounter.wrap(Storage.load({ storagePointer: dynamicSchemaLengthSlot }));

    // Set `dataToSet` at the given index
    _setPartialDynamicData(tableId, keyTuple, dynamicSchemaIndex, startByteIndex, dataToSet);

    // Compute start index for the splice event
    uint256 start;
    unchecked {
      // (safe because it's a few uint40 values, which can't overflow uint48)
      start = startByteIndex;
      for (uint8 i; i < dynamicSchemaIndex; i++) {
        start += encodedLengths.atIndex(i);
      }
    }

    // Emit event to notify indexers
    emit StoreCore.StoreSpliceDynamicData({
      tableId: tableId,
      keyTuple: keyTuple,
      start: uint48(start),
      deleteCount: uint40(dataToSet.length),
      data: dataToSet,
      encodedLengths: encodedLengths.unwrap()
    });
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
   * Get a single static field from the given tableId and key tuple, with the given value field layout.
   * Returns dynamic bytes memory in the size of the field.
   */
  function _getStaticFieldBytes(
    bytes32 tableId,
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

  /**
   * Verify static data length + dynamic data length matches the given data
   * Returns the static and dynamic lengths
   */
  function _validateDataLength(
    FieldLayout fieldLayout,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData
  ) internal pure {
    if (fieldLayout.staticDataLength() != staticData.length) {
      revert IStoreErrors.StoreCore_InvalidStaticDataLength(fieldLayout.staticDataLength(), staticData.length);
    }
    if (encodedLengths.total() != dynamicData.length) {
      revert IStoreErrors.StoreCore_InvalidDynamicDataLength(encodedLengths.total(), dynamicData.length);
    }
  }

  /////////////////////////////////////////////////////////////////////////
  //    STATIC DATA
  /////////////////////////////////////////////////////////////////////////

  /**
   * Compute the storage location based on tableId id and index tuple
   */
  function _getStaticDataLocation(bytes32 tableId, bytes32[] memory keyTuple) internal pure returns (uint256) {
    return uint256(SLOT ^ keccak256(abi.encodePacked(tableId, keyTuple)));
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
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex
  ) internal pure returns (uint256) {
    return uint256(DYNMAIC_DATA_SLOT ^ bytes1(fieldIndex) ^ keccak256(abi.encodePacked(tableId, keyTuple)));
  }

  /**
   * Compute the storage location for the length of the dynamic data
   */
  function _getDynamicDataLengthLocation(bytes32 tableId, bytes32[] memory keyTuple) internal pure returns (uint256) {
    return uint256(DYNAMIC_DATA_LENGTH_SLOT ^ keccak256(abi.encodePacked(tableId, keyTuple)));
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
    uint8 dynamicSchemaIndex, // fieldIndex - numStaticFields
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
