// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "@latticexyz/schema-type/src/solidity/SchemaType.sol";
import { Bytes } from "./Bytes.sol";
import { Storage } from "./Storage.sol";
import { Memory } from "./Memory.sol";
import { Schema, SchemaLib } from "./Schema.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { Slice, SliceLib } from "./Slice.sol";
import { StoreMetadata, Hooks, HooksTableId } from "./codegen/Tables.sol";
import { IStoreErrors } from "./IStoreErrors.sol";
import { IStoreHook } from "./IStore.sol";
import { Utils } from "./Utils.sol";
import { TableId } from "./TableId.sol";

library StoreCore {
  using TableId for bytes32;

  // note: the preimage of the tuple of keys used to index is part of the event, so it can be used by indexers
  event StoreSetRecord(bytes32 tableId, bytes32[] key, bytes data);
  event StoreSetField(bytes32 tableId, bytes32[] key, uint8 schemaIndex, bytes data);
  event StoreDeleteRecord(bytes32 tableId, bytes32[] key);
  event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes data);

  /**
   * Initialize internal tables.
   * Consumers must call this function in their constructor.
   * TODO: should we turn the schema table into a "proper table" and register it here?
   * (see https://github.com/latticexyz/mud/issues/444)
   */
  function initialize() internal {
    // Register internal schema table
    registerSchema(
      StoreCoreInternal.SCHEMA_TABLE,
      SchemaLib.encode(SchemaType.BYTES32, SchemaType.BYTES32), // The Schema table's valueSchema is { valueSchema: BYTES32, keySchema: BYTES32 }
      SchemaLib.encode(SchemaType.UINT256) // The Schema table's keySchema is { tableId: UINT256 }
    );

    // Register other internal tables
    //
    // For hooks and metadata tables, we need to register the schemas first and
    // then their metadata. This is because setMetadata (a store set record)
    // triggers a hook call, which uses getField, which will fail if the schema
    // is not registered yet.
    Hooks.registerSchema();
    StoreMetadata.registerSchema();
    Hooks.setMetadata();
    StoreMetadata.setMetadata();

    // Set metadata for the schema table
    string[] memory keyNames = new string[](1);
    keyNames[0] = "tableId";
    string[] memory fieldNames = new string[](2);
    fieldNames[0] = "valueSchema";
    fieldNames[1] = "keySchema";
    StoreMetadata.set(StoreCoreInternal.SCHEMA_TABLE, "schema", abi.encode(keyNames), abi.encode(fieldNames));
  }

  /************************************************************************
   *
   *    SCHEMA
   *
   ************************************************************************/

  /**
   * Get the schema for the given tableId
   */
  function getSchema(bytes32 tableId) internal view returns (Schema schema) {
    schema = StoreCoreInternal._getSchema(tableId);
    if (schema.isEmpty()) {
      revert IStoreErrors.StoreCore_TableNotFound(tableId, tableId.toString());
    }
  }

  /**
   * Get the key schema for the given tableId
   */
  function getKeySchema(bytes32 tableId) internal view returns (Schema keySchema) {
    keySchema = StoreCoreInternal._getKeySchema(tableId);
    if (keySchema.isEmpty()) {
      revert IStoreErrors.StoreCore_TableNotFound(tableId, tableId.toString());
    }
  }

  /**
   * Check if a table with the given tableId exists
   */
  function hasTable(bytes32 tableId) internal view returns (bool) {
    return !StoreCoreInternal._getSchema(tableId).isEmpty();
  }

  /**
   * Register a new tableId schema
   */
  function registerSchema(bytes32 tableId, Schema valueSchema, Schema keySchema) internal {
    // Verify the schema is valid
    valueSchema.validate({ allowEmpty: false });
    keySchema.validate({ allowEmpty: true });

    // Verify the schema doesn't exist yet
    if (hasTable(tableId)) {
      revert IStoreErrors.StoreCore_TableAlreadyExists(tableId, tableId.toString());
    }

    // Register the schema
    StoreCoreInternal._registerSchemaUnchecked(tableId, valueSchema, keySchema);
  }

  /**
   * Set metadata for a given tableId
   */
  function setMetadata(
    bytes32 tableId,
    string memory tableName,
    string[] memory keyNames,
    string[] memory fieldNames
  ) internal {
    Schema schema = getSchema(tableId);

    // Verify the number of field names corresponds to the schema length
    if (!(fieldNames.length == 0 || fieldNames.length == schema.numFields())) {
      revert IStoreErrors.StoreCore_InvalidFieldNamesLength(schema.numFields(), fieldNames.length);
    }

    // Set metadata
    StoreMetadata.set(tableId, tableName, abi.encode(keyNames), abi.encode(fieldNames));
  }

  /************************************************************************
   *
   *    REGISTER HOOKS
   *
   ************************************************************************/

  /*
   * Register hooks to be called when a record or field is set or deleted
   */
  function registerStoreHook(bytes32 tableId, IStoreHook hook) internal {
    Hooks.push(tableId, address(hook));
  }

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  /**
   * Set full data record for the given tableId and key tuple (static and dynamic data)
   */
  function setRecord(bytes32 tableId, bytes32[] memory key, bytes memory data) internal {
    // verify the value has the correct length for the tableId (based on the tableId's schema)
    // to prevent invalid data from being stored
    Schema schema = getSchema(tableId);

    // Verify static data length + dynamic data length matches the given data
    (uint256 staticLength, PackedCounter dynamicLength) = StoreCoreInternal._validateDataLength(schema, data);

    // Emit event to notify indexers
    emit StoreSetRecord(tableId, key, data);

    // Call onSetRecord hooks (before actually modifying the state, so observers have access to the previous state if needed)
    address[] memory hooks = Hooks.get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onSetRecord(tableId, key, data);
    }

    // Store the static data at the static data location
    uint256 staticDataLocation = StoreCoreInternal._getStaticDataLocation(tableId, key);
    uint256 memoryPointer = Memory.dataPointer(data);
    Storage.store({
      storagePointer: staticDataLocation,
      offset: 0,
      memoryPointer: memoryPointer,
      length: staticLength
    });
    memoryPointer += staticLength + 32; // move the memory pointer to the start of the dynamic data (skip the encoded dynamic length)

    // If there is no dynamic data, we're done
    if (schema.numDynamicFields() == 0) return;

    // Store the dynamic data length at the dynamic data length location
    uint256 dynamicDataLengthLocation = StoreCoreInternal._getDynamicDataLengthLocation(tableId, key);
    Storage.store({ storagePointer: dynamicDataLengthLocation, data: dynamicLength.unwrap() });

    // For every dynamic element, slice off the dynamic data and store it at the dynamic location
    uint256 dynamicDataLocation;
    uint256 dynamicDataLength;
    for (uint8 i; i < schema.numDynamicFields(); ) {
      dynamicDataLocation = StoreCoreInternal._getDynamicDataLocation(tableId, key, i);
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

  function setField(bytes32 tableId, bytes32[] memory key, uint8 schemaIndex, bytes memory data) internal {
    Schema schema = getSchema(tableId);

    // Emit event to notify indexers
    emit StoreSetField(tableId, key, schemaIndex, data);

    // Call onBeforeSetField hooks (before modifying the state)
    address[] memory hooks = Hooks.get(tableId);

    for (uint256 i; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onBeforeSetField(tableId, key, schemaIndex, data);
    }

    if (schemaIndex < schema.numStaticFields()) {
      StoreCoreInternal._setStaticField(tableId, key, schema, schemaIndex, data);
    } else {
      StoreCoreInternal._setDynamicField(tableId, key, schema, schemaIndex, data);
    }

    // Call onAfterSetField hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onAfterSetField(tableId, key, schemaIndex, data);
    }
  }

  function deleteRecord(bytes32 tableId, bytes32[] memory key) internal {
    Schema schema = getSchema(tableId);

    // Emit event to notify indexers
    emit StoreDeleteRecord(tableId, key);

    // Call onDeleteRecord hooks (before actually modifying the state, so observers have access to the previous state if needed)
    address[] memory hooks = Hooks.get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onDeleteRecord(tableId, key);
    }

    // Delete static data
    uint256 staticDataLocation = StoreCoreInternal._getStaticDataLocation(tableId, key);
    Storage.store({ storagePointer: staticDataLocation, offset: 0, data: new bytes(schema.staticDataLength()) });

    // If there are no dynamic fields, we're done
    if (schema.numDynamicFields() == 0) return;

    // Delete dynamic data length
    uint256 dynamicDataLengthLocation = StoreCoreInternal._getDynamicDataLengthLocation(tableId, key);
    Storage.store({ storagePointer: dynamicDataLengthLocation, data: bytes32(0) });
  }

  function pushToField(bytes32 tableId, bytes32[] memory key, uint8 schemaIndex, bytes memory dataToPush) internal {
    Schema schema = getSchema(tableId);

    if (schemaIndex < schema.numStaticFields()) {
      revert IStoreErrors.StoreCore_NotDynamicField();
    }

    // TODO add push-specific event and hook to avoid the storage read? (https://github.com/latticexyz/mud/issues/444)
    bytes memory fullData = abi.encodePacked(
      StoreCoreInternal._getDynamicField(tableId, key, schemaIndex, schema),
      dataToPush
    );

    // Emit event to notify indexers
    emit StoreSetField(tableId, key, schemaIndex, fullData);

    // Call onBeforeSetField hooks (before modifying the state)
    address[] memory hooks = Hooks.get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onBeforeSetField(tableId, key, schemaIndex, fullData);
    }

    StoreCoreInternal._pushToDynamicField(tableId, key, schema, schemaIndex, dataToPush);

    // Call onAfterSetField hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onAfterSetField(tableId, key, schemaIndex, fullData);
    }
  }

  function popFromField(bytes32 tableId, bytes32[] memory key, uint8 schemaIndex, uint256 byteLengthToPop) internal {
    Schema schema = getSchema(tableId);

    if (schemaIndex < schema.numStaticFields()) {
      revert IStoreErrors.StoreCore_NotDynamicField();
    }

    // TODO add pop-specific event and hook to avoid the storage read? (https://github.com/latticexyz/mud/issues/444)
    bytes memory fullData;
    {
      bytes memory oldData = StoreCoreInternal._getDynamicField(tableId, key, schemaIndex, schema);
      fullData = SliceLib.getSubslice(oldData, 0, oldData.length - byteLengthToPop).toBytes();
    }

    // Emit event to notify indexers
    emit StoreSetField(tableId, key, schemaIndex, fullData);

    // Call onBeforeSetField hooks (before modifying the state)
    address[] memory hooks = Hooks.get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onBeforeSetField(tableId, key, schemaIndex, fullData);
    }

    StoreCoreInternal._popFromDynamicField(tableId, key, schema, schemaIndex, byteLengthToPop);

    // Call onAfterSetField hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onAfterSetField(tableId, key, schemaIndex, fullData);
    }
  }

  function updateInField(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes memory dataToSet
  ) internal {
    Schema schema = getSchema(tableId);

    if (schemaIndex < schema.numStaticFields()) {
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
      bytes memory oldData = StoreCoreInternal._getDynamicField(tableId, key, schemaIndex, schema);
      fullData = abi.encodePacked(
        SliceLib.getSubslice(oldData, 0, startByteIndex).toBytes(),
        dataToSet,
        SliceLib.getSubslice(oldData, startByteIndex + dataToSet.length, oldData.length).toBytes()
      );
    }

    // Emit event to notify indexers
    emit StoreSetField(tableId, key, schemaIndex, fullData);

    // Call onBeforeSetField hooks (before modifying the state)
    address[] memory hooks = Hooks.get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onBeforeSetField(tableId, key, schemaIndex, fullData);
    }

    StoreCoreInternal._setDynamicFieldItem(tableId, key, schema, schemaIndex, startByteIndex, dataToSet);

    // Call onAfterSetField hooks (after modifying the state)
    for (uint256 i; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onAfterSetField(tableId, key, schemaIndex, fullData);
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
  function emitEphemeralRecord(bytes32 tableId, bytes32[] memory key, bytes memory data) internal {
    // verify the value has the correct length for the tableId (based on the tableId's schema)
    // to prevent invalid data from being emitted
    Schema schema = getSchema(tableId);

    // Verify static data length + dynamic data length matches the given data
    StoreCoreInternal._validateDataLength(schema, data);

    // Emit event to notify indexers
    emit StoreEphemeralRecord(tableId, key, data);

    // Call onSetRecord hooks
    address[] memory hooks = Hooks.get(tableId);
    for (uint256 i; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onSetRecord(tableId, key, data);
    }
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/

  /**
   * Get full record (all fields, static and dynamic data) for the given tableId and key tuple (loading schema from storage)
   */
  function getRecord(bytes32 tableId, bytes32[] memory key) internal view returns (bytes memory) {
    Schema schema = getSchema(tableId);
    return getRecord(tableId, key, schema);
  }

  /**
   * Get full record (all fields, static and dynamic data) for the given tableId and key tuple, with the given schema
   */
  function getRecord(bytes32 tableId, bytes32[] memory key, Schema schema) internal view returns (bytes memory) {
    // Get the static data length
    uint256 staticLength = schema.staticDataLength();
    uint256 outputLength = staticLength;

    // Load the dynamic data length if there are dynamic fields
    PackedCounter dynamicDataLength;
    uint256 numDynamicFields = schema.numDynamicFields();
    if (numDynamicFields > 0) {
      dynamicDataLength = StoreCoreInternal._loadEncodedDynamicDataLength(tableId, key);
      // TODO should total output include dynamic data length even if it's 0?
      if (dynamicDataLength.total() > 0) {
        outputLength += 32 + dynamicDataLength.total(); // encoded length + data
      }
    }

    // Allocate length for the full packed data (static and dynamic)
    bytes memory data = new bytes(outputLength);
    uint256 memoryPointer = Memory.dataPointer(data);

    // Load the static data from storage
    StoreCoreInternal._getStaticData(tableId, key, staticLength, memoryPointer);

    // Early return if there are no dynamic fields
    if (dynamicDataLength.total() == 0) return data;
    // Advance memoryPointer to the dynamic data section
    memoryPointer += staticLength;

    // Append the encoded dynamic length
    Memory.store(memoryPointer, dynamicDataLength.unwrap());
    // Advance memoryPointer by the length of `dynamicDataLength` (1 word)
    memoryPointer += 0x20;

    // Append dynamic data
    for (uint8 i; i < numDynamicFields; i++) {
      uint256 dynamicDataLocation = StoreCoreInternal._getDynamicDataLocation(tableId, key, i);
      uint256 length = dynamicDataLength.atIndex(i);
      Storage.load({ storagePointer: dynamicDataLocation, length: length, offset: 0, memoryPointer: memoryPointer });
      // Advance memoryPointer by the length of this dynamic field
      memoryPointer += length;
    }

    // Return the packed data
    return data;
  }

  /**
   * Get a single field from the given tableId and key tuple (loading schema from storage)
   */
  function getField(bytes32 tableId, bytes32[] memory key, uint8 schemaIndex) internal view returns (bytes memory) {
    Schema schema = getSchema(tableId);
    return getField(tableId, key, schemaIndex, schema);
  }

  /**
   * Get a single field from the given tableId and key tuple, with the given schema
   */
  function getField(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    Schema schema
  ) internal view returns (bytes memory) {
    if (schemaIndex < schema.numStaticFields()) {
      return StoreCoreInternal._getStaticField(tableId, key, schemaIndex, schema);
    } else {
      return StoreCoreInternal._getDynamicField(tableId, key, schemaIndex, schema);
    }
  }

  /**
   * Get the byte length of a single field from the given tableId and key tuple, with the given schema
   */
  function getFieldLength(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    Schema schema
  ) internal view returns (uint256) {
    uint8 numStaticFields = schema.numStaticFields();
    if (schemaIndex < numStaticFields) {
      SchemaType schemaType = schema.atIndex(schemaIndex);
      return schemaType.getStaticByteLength();
    } else {
      // Get the length and storage location of the dynamic field
      uint8 dynamicSchemaIndex = schemaIndex - numStaticFields;
      return StoreCoreInternal._loadEncodedDynamicDataLength(tableId, key).atIndex(dynamicSchemaIndex);
    }
  }

  /**
   * Get a byte slice (including start, excluding end) of a single dynamic field from the given tableId and key tuple, with the given schema.
   * The slice is unchecked and will return invalid data if `start`:`end` overflow.
   */
  function getFieldSlice(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    Schema schema,
    uint256 start,
    uint256 end
  ) internal view returns (bytes memory) {
    uint8 numStaticFields = schema.numStaticFields();
    if (schemaIndex < schema.numStaticFields()) {
      revert IStoreErrors.StoreCore_NotDynamicField();
    }

    // Get the length and storage location of the dynamic field
    uint8 dynamicSchemaIndex = schemaIndex - numStaticFields;
    uint256 location = StoreCoreInternal._getDynamicDataLocation(tableId, key, dynamicSchemaIndex);

    return Storage.load({ storagePointer: location, length: end - start, offset: start });
  }
}

library StoreCoreInternal {
  bytes32 internal constant SLOT = keccak256("mud.store");
  bytes32 internal constant SCHEMA_TABLE = bytes32(abi.encodePacked(bytes16("mudstore"), bytes16("schema")));

  /************************************************************************
   *
   *    SCHEMA
   *
   ************************************************************************/

  function _getSchema(bytes32 tableId) internal view returns (Schema) {
    bytes32[] memory key = new bytes32[](1);
    key[0] = tableId;
    uint256 location = StoreCoreInternal._getStaticDataLocation(SCHEMA_TABLE, key);
    return Schema.wrap(Storage.load({ storagePointer: location }));
  }

  function _getKeySchema(bytes32 tableId) internal view returns (Schema) {
    bytes32[] memory key = new bytes32[](1);
    key[0] = tableId;
    uint256 location = StoreCoreInternal._getStaticDataLocation(SCHEMA_TABLE, key);
    return Schema.wrap(Storage.load({ storagePointer: location + 0x20 }));
  }

  /**
   * Register a new tableId schema without validity checks
   */
  function _registerSchemaUnchecked(bytes32 tableId, Schema valueSchema, Schema keySchema) internal {
    bytes32[] memory key = new bytes32[](1);
    key[0] = tableId;
    uint256 location = _getStaticDataLocation(SCHEMA_TABLE, key);
    Storage.store({ storagePointer: location, data: valueSchema.unwrap() });
    Storage.store({ storagePointer: location + 0x20, data: keySchema.unwrap() });

    // Emit an event to notify indexers
    emit StoreCore.StoreSetRecord(SCHEMA_TABLE, key, abi.encodePacked(valueSchema.unwrap(), keySchema.unwrap()));
  }

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  function _setStaticField(
    bytes32 tableId,
    bytes32[] memory key,
    Schema schema,
    uint8 schemaIndex,
    bytes memory data
  ) internal {
    // verify the value has the correct length for the field
    SchemaType schemaType = schema.atIndex(schemaIndex);
    if (schemaType.getStaticByteLength() != data.length) {
      revert IStoreErrors.StoreCore_InvalidDataLength(schemaType.getStaticByteLength(), data.length);
    }

    // Store the provided value in storage
    uint256 location = _getStaticDataLocation(tableId, key);
    uint256 offset = _getStaticDataOffset(schema, schemaIndex);
    Storage.store({ storagePointer: location, offset: offset, data: data });
  }

  function _setDynamicField(
    bytes32 tableId,
    bytes32[] memory key,
    Schema schema,
    uint8 schemaIndex,
    bytes memory data
  ) internal {
    uint8 dynamicSchemaIndex = schemaIndex - schema.numStaticFields();

    // Update the dynamic data length
    _setDynamicDataLengthAtIndex(tableId, key, dynamicSchemaIndex, data.length);

    // Store the provided value in storage
    uint256 dynamicDataLocation = _getDynamicDataLocation(tableId, key, dynamicSchemaIndex);
    Storage.store({ storagePointer: dynamicDataLocation, data: data });
  }

  function _pushToDynamicField(
    bytes32 tableId,
    bytes32[] memory key,
    Schema schema,
    uint8 schemaIndex,
    bytes memory dataToPush
  ) internal {
    uint8 dynamicSchemaIndex = schemaIndex - schema.numStaticFields();

    // Load dynamic data length from storage
    uint256 dynamicSchemaLengthSlot = _getDynamicDataLengthLocation(tableId, key);
    PackedCounter encodedLengths = PackedCounter.wrap(Storage.load({ storagePointer: dynamicSchemaLengthSlot }));

    // Update the encoded length
    uint256 oldFieldLength = encodedLengths.atIndex(dynamicSchemaIndex);
    encodedLengths = encodedLengths.setAtIndex(dynamicSchemaIndex, oldFieldLength + dataToPush.length);

    // Set the new length
    Storage.store({ storagePointer: dynamicSchemaLengthSlot, data: encodedLengths.unwrap() });

    // Append `dataToPush` to the end of the data in storage
    _setPartialDynamicData(tableId, key, dynamicSchemaIndex, oldFieldLength, dataToPush);
  }

  function _popFromDynamicField(
    bytes32 tableId,
    bytes32[] memory key,
    Schema schema,
    uint8 schemaIndex,
    uint256 byteLengthToPop
  ) internal {
    uint8 dynamicSchemaIndex = schemaIndex - schema.numStaticFields();

    // Load dynamic data length from storage
    uint256 dynamicSchemaLengthSlot = _getDynamicDataLengthLocation(tableId, key);
    PackedCounter encodedLengths = PackedCounter.wrap(Storage.load({ storagePointer: dynamicSchemaLengthSlot }));

    // Update the encoded length
    uint256 oldFieldLength = encodedLengths.atIndex(dynamicSchemaIndex);
    encodedLengths = encodedLengths.setAtIndex(dynamicSchemaIndex, oldFieldLength - byteLengthToPop);

    // Set the new length
    Storage.store({ storagePointer: dynamicSchemaLengthSlot, data: encodedLengths.unwrap() });

    // Data can be left unchanged, push/set do not assume storage to be 0s
  }

  // startOffset is measured in bytes
  function _setDynamicFieldItem(
    bytes32 tableId,
    bytes32[] memory key,
    Schema schema,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes memory dataToSet
  ) internal {
    uint8 dynamicSchemaIndex = schemaIndex - schema.numStaticFields();

    // Set `dataToSet` at the given index
    _setPartialDynamicData(tableId, key, dynamicSchemaIndex, startByteIndex, dataToSet);
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/

  /**
   * Get full static record for the given tableId and key tuple (loading schema's static length from storage)
   */
  function _getStaticData(bytes32 tableId, bytes32[] memory key, uint256 memoryPointer) internal view {
    Schema schema = _getSchema(tableId);
    _getStaticData(tableId, key, schema.staticDataLength(), memoryPointer);
  }

  /**
   * Get full static data for the given tableId and key tuple, with the given static length
   */
  function _getStaticData(bytes32 tableId, bytes32[] memory key, uint256 length, uint256 memoryPointer) internal view {
    if (length == 0) return;

    // Load the data from storage
    uint256 location = _getStaticDataLocation(tableId, key);
    Storage.load({ storagePointer: location, length: length, offset: 0, memoryPointer: memoryPointer });
  }

  /**
   * Get a single static field from the given tableId and key tuple, with the given schema
   */
  function _getStaticField(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    Schema schema
  ) internal view returns (bytes memory) {
    // Get the length, storage location and offset of the static field
    SchemaType schemaType = schema.atIndex(schemaIndex);
    uint256 dataLength = schemaType.getStaticByteLength();
    uint256 location = _getStaticDataLocation(tableId, key);
    uint256 offset = _getStaticDataOffset(schema, schemaIndex);

    // Load the data from storage

    return Storage.load({ storagePointer: location, length: dataLength, offset: offset });
  }

  /**
   * Get a single dynamic field from the given tableId and key tuple, with the given schema
   */
  function _getDynamicField(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    Schema schema
  ) internal view returns (bytes memory) {
    // Get the length and storage location of the dynamic field
    uint8 dynamicSchemaIndex = schemaIndex - schema.numStaticFields();
    uint256 location = _getDynamicDataLocation(tableId, key, dynamicSchemaIndex);
    uint256 dataLength = _loadEncodedDynamicDataLength(tableId, key).atIndex(dynamicSchemaIndex);

    return Storage.load({ storagePointer: location, length: dataLength });
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
    Schema schema,
    bytes memory data
  ) internal pure returns (uint256 staticLength, PackedCounter dynamicLength) {
    staticLength = schema.staticDataLength();
    uint256 expectedLength = staticLength;
    dynamicLength;
    if (schema.numDynamicFields() > 0) {
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
  function _getStaticDataLocation(bytes32 tableId, bytes32[] memory key) internal pure returns (uint256) {
    return uint256(keccak256(abi.encode(SLOT, tableId, key)));
  }

  /**
   * Get storage offset for the given schema and (static length) index
   */
  function _getStaticDataOffset(Schema schema, uint8 schemaIndex) internal pure returns (uint256) {
    uint256 offset = 0;
    for (uint256 i; i < schemaIndex; i++) {
      offset += schema.atIndex(i).getStaticByteLength();
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
    bytes32[] memory key,
    uint8 schemaIndex
  ) internal pure returns (uint256) {
    return uint256(keccak256(abi.encode(SLOT, tableId, key, schemaIndex)));
  }

  /**
   * Compute the storage location for the length of the dynamic data
   */
  function _getDynamicDataLengthLocation(bytes32 tableId, bytes32[] memory key) internal pure returns (uint256) {
    return uint256(keccak256(abi.encode(SLOT, tableId, key, "length")));
  }

  /**
   * Get the length of the dynamic data for the given schema and index
   */
  function _loadEncodedDynamicDataLength(bytes32 tableId, bytes32[] memory key) internal view returns (PackedCounter) {
    // Load dynamic data length from storage
    uint256 dynamicSchemaLengthSlot = _getDynamicDataLengthLocation(tableId, key);
    return PackedCounter.wrap(Storage.load({ storagePointer: dynamicSchemaLengthSlot }));
  }

  /**
   * Set the length of the dynamic data (in bytes) for the given schema and index
   */
  function _setDynamicDataLengthAtIndex(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 dynamicSchemaIndex, // schemaIndex - numStaticFields
    uint256 newLengthAtIndex
  ) internal {
    // Load dynamic data length from storage
    uint256 dynamicSchemaLengthSlot = _getDynamicDataLengthLocation(tableId, key);
    PackedCounter encodedLengths = PackedCounter.wrap(Storage.load({ storagePointer: dynamicSchemaLengthSlot }));

    // Update the encoded lengths
    encodedLengths = encodedLengths.setAtIndex(dynamicSchemaIndex, newLengthAtIndex);

    // Set the new lengths
    Storage.store({ storagePointer: dynamicSchemaLengthSlot, data: encodedLengths.unwrap() });
  }

  /**
   * Modify a part of the dynamic field's data (without changing the field's length)
   */
  function _setPartialDynamicData(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 dynamicSchemaIndex,
    uint256 startByteIndex,
    bytes memory partialData
  ) internal {
    uint256 dynamicDataLocation = _getDynamicDataLocation(tableId, key, dynamicSchemaIndex);
    // start index is in bytes, whereas storage slots are in 32-byte words
    dynamicDataLocation += startByteIndex / 32;
    // partial storage slot offset (there is no inherent offset, as each dynamic field starts at its own storage slot)
    uint256 offset = startByteIndex % 32;
    Storage.store({ storagePointer: dynamicDataLocation, offset: offset, data: partialData });
  }
}

// Overloads for single key and some fixed length array keys for better devex
library StoreCoreExtended {
  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/
  function getRecord(bytes32 tableId, bytes32 _key) internal view returns (bytes memory) {
    bytes32[] memory key = new bytes32[](1);
    key[0] = _key;
    return StoreCore.getRecord(tableId, key);
  }

  function getData(bytes32 tableId, bytes32[2] memory _key) internal view returns (bytes memory) {
    bytes32[] memory key = new bytes32[](2);
    key[0] = _key[0];
    key[1] = _key[1];
    return StoreCore.getRecord(tableId, key);
  }
}
