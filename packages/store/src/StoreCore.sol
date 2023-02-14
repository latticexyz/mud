// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Bytes } from "./Bytes.sol";
import { SchemaType, getStaticByteLength, getElementByteLength } from "./Types.sol";
import { Storage } from "./Storage.sol";
import { Memory } from "./Memory.sol";
import { console } from "forge-std/console.sol";
import { Schema, SchemaLib } from "./Schema.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { Slice } from "./Slice.sol";
import { HooksTable, tableId as HooksTableId } from "./tables/HooksTable.sol";
import { IStoreHook } from "./IStore.sol";

library StoreCore {
  // note: the preimage of the tuple of keys used to index is part of the event, so it can be used by indexers
  event MudStoreSetRecord(bytes32 table, bytes32[] key, bytes data);
  event MudStoreSetField(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data);
  event MudStoreDeleteRecord(bytes32 table, bytes32[] key);

  error StoreCore_TableAlreadyExists(bytes32 table);
  error StoreCore_TableNotFound(bytes32 table);
  error StoreCore_NotImplemented();
  error StoreCore_InvalidDataLength(uint256 expected, uint256 received);
  error StoreCore_NoDynamicField();

  /**
   * Initialize internal tables.
   * Consumers must call this function in their constructor.
   * TODO: should we turn the schema table into a "proper table" and register it here?
   */
  function initialize() internal {
    registerSchema(StoreCoreInternal.SCHEMA_TABLE, SchemaLib.encode(SchemaType.Bytes32));
    registerSchema(HooksTableId, HooksTable.getSchema());
  }

  /************************************************************************
   *
   *    SCHEMA
   *
   ************************************************************************/

  /**
   * Check if the given table exists
   */
  function hasTable(bytes32 table) internal view returns (bool) {
    return !getSchema(table).isEmpty();
  }

  /**
   * Register a new table schema
   */
  function registerSchema(bytes32 table, Schema schema) internal {
    // Verify the schema is valid
    schema.validate();

    // Verify the schema doesn't exist yet
    if (hasTable(table)) {
      revert StoreCore_TableAlreadyExists(table);
    }

    // Register the schema
    StoreCoreInternal._registerSchemaUnchecked(table, schema);
  }

  /**
   * Get the schema for the given table
   */
  function getSchema(bytes32 table) internal view returns (Schema schema) {
    return StoreCoreInternal._getSchema(table);
  }

  /************************************************************************
   *
   *    REGISTER HOOKS
   *
   ************************************************************************/

  /*
   * Register hooks to be called when a record or field is set or deleted
   */
  function registerHook(bytes32 table, IStoreHook hook) external {
    HooksTable.push(table, address(hook));
  }

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  /**
   * Set full data record for the given table and key tuple (static and dynamic data)
   */
  function setRecord(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) internal {
    // verify the value has the correct length for the table (based on the table's schema)
    // to prevent invalid data from being stored
    Schema schema = getSchema(table);

    // Verify static data length + dynamic data length matches the given data
    uint256 staticLength = schema.staticDataLength();
    uint256 expectedLength = staticLength;
    PackedCounter dynamicLength;
    if (schema.numDynamicFields() > 0) {
      // Dynamic length is encoded at the start of the dynamic length blob
      dynamicLength = PackedCounter.wrap(Bytes.slice32(data, staticLength));
      expectedLength += 32 + dynamicLength.total(); // encoded length + data
    }

    if (expectedLength != data.length) {
      revert StoreCore_InvalidDataLength(expectedLength, data.length);
    }

    // Emit event to notify indexers
    emit MudStoreSetRecord(table, key, data);

    // Call onSetRecord hooks (before actually modifying the state, so observers have access to the previous state if needed)
    address[] memory hooks = HooksTable.get(table);
    for (uint256 i = 0; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onSetRecord(table, key, data);
    }

    // Store the static data at the static data location
    uint256 staticDataLocation = StoreCoreInternal._getStaticDataLocation(table, key);
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
    uint256 dynamicDataLengthLocation = StoreCoreInternal._getDynamicDataLengthLocation(table, key);
    Storage.store({ storagePointer: dynamicDataLengthLocation, data: dynamicLength.unwrap() });

    // For every dynamic element, slice off the dynamic data and store it at the dynamic location
    uint256 dynamicDataLocation;
    uint256 dynamicDataLength;
    for (uint8 i; i < schema.numDynamicFields(); ) {
      dynamicDataLocation = StoreCoreInternal._getDynamicDataLocation(table, key, i);
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

  function setField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data
  ) internal {
    Schema schema = getSchema(table);

    // Emit event to notify indexers
    emit MudStoreSetField(table, key, schemaIndex, data);

    // Call onSetField hooks (before actually modifying the state, so observers have access to the previous state if needed)
    address[] memory hooks = HooksTable.get(table);
    for (uint256 i = 0; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onSetField(table, key, schemaIndex, data);
    }

    if (schemaIndex < schema.numStaticFields()) {
      StoreCoreInternal._setStaticField(table, key, schema, schemaIndex, data);
    } else {
      StoreCoreInternal._setDynamicField(table, key, schema, schemaIndex, data);
    }
  }

  function deleteRecord(bytes32 table, bytes32[] memory key) internal {
    // Get schema for this table
    Schema schema = getSchema(table);

    // Emit event to notify indexers
    emit MudStoreDeleteRecord(table, key);

    // Call onDeleteRecord hooks (before actually modifying the state, so observers have access to the previous state if needed)
    address[] memory hooks = HooksTable.get(table);
    for (uint256 i = 0; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onDeleteRecord(table, key);
    }

    // Delete static data
    uint256 staticDataLocation = StoreCoreInternal._getStaticDataLocation(table, key);
    Storage.store({ storagePointer: staticDataLocation, offset: 0, data: new bytes(schema.staticDataLength()) });

    // If there are no dynamic fields, we're done
    if (schema.numDynamicFields() == 0) return;

    // Delete dynamic data length
    uint256 dynamicDataLengthLocation = StoreCoreInternal._getDynamicDataLengthLocation(table, key);
    Storage.store({ storagePointer: dynamicDataLengthLocation, data: bytes32(0) });
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/

  /**
   * Get full record (all fields, static and dynamic data) for the given table and key tuple (loading schema from storage)
   */
  function getRecord(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    // Get schema for this table
    Schema schema = getSchema(table);
    if (schema.isEmpty()) revert StoreCore_TableNotFound(table);

    return getRecord(table, key, schema);
  }

  /**
   * Get full record (all fields, static and dynamic data) for the given table and key tuple, with the given schema
   */
  function getRecord(
    bytes32 table,
    bytes32[] memory key,
    Schema schema
  ) internal view returns (bytes memory) {
    // Get the static data length
    uint256 staticLength = schema.staticDataLength();
    uint256 outputLength = staticLength;

    // Load the dynamic data length if there are dynamic fields
    PackedCounter dynamicDataLength;
    uint256 numDynamicFields = schema.numDynamicFields();
    if (numDynamicFields > 0) {
      dynamicDataLength = StoreCoreInternal._loadEncodedDynamicDataLength(table, key);
      // TODO should total output include dynamic data length even if it's 0?
      if (dynamicDataLength.total() > 0) {
        outputLength += 32 + dynamicDataLength.total(); // encoded length + data
      }
    }

    // Allocate length for the full packed data (static and dynamic)
    bytes memory data = new bytes(outputLength);
    uint256 memoryPointer = Memory.dataPointer(data);

    // Load the static data from storage
    StoreCoreInternal._getStaticData(table, key, staticLength, memoryPointer);

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
      uint256 dynamicDataLocation = StoreCoreInternal._getDynamicDataLocation(table, key, i);
      uint256 length = dynamicDataLength.atIndex(i);
      Storage.load({ storagePointer: dynamicDataLocation, length: length, offset: 0, memoryPointer: memoryPointer });
      // Advance memoryPointer by the length of this dynamic field
      memoryPointer += length;
    }

    // Return the packed data
    return data;
  }

  /**
   * Get a single field from the given table and key tuple (loading schema from storage)
   */
  function getField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex
  ) internal view returns (bytes memory) {
    Schema schema = getSchema(table);
    return getField(table, key, schemaIndex, schema);
  }

  /**
   * Get a single field from the given table and key tuple, with the given schema
   */
  function getField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    Schema schema
  ) internal view returns (bytes memory) {
    if (schemaIndex < schema.numStaticFields()) {
      return StoreCoreInternal._getStaticField(table, key, schemaIndex, schema);
    } else {
      return StoreCoreInternal._getDynamicField(table, key, schemaIndex, schema);
    }
  }
}

library StoreCoreInternal {
  bytes32 internal constant SLOT = keccak256("mud.store");
  bytes32 internal constant SCHEMA_TABLE = keccak256("mud.store.table.schema");

  /************************************************************************
   *
   *    SCHEMA
   *
   ************************************************************************/

  function _getSchema(bytes32 table) internal view returns (Schema) {
    bytes32[] memory key = new bytes32[](1);
    key[0] = table;
    uint256 location = StoreCoreInternal._getStaticDataLocation(SCHEMA_TABLE, key);
    return Schema.wrap(Storage.load({ storagePointer: location }));
  }

  /**
   * Register a new table schema without validity checks
   */
  function _registerSchemaUnchecked(bytes32 table, Schema schema) internal {
    bytes32[] memory key = new bytes32[](1);
    key[0] = table;
    uint256 location = _getStaticDataLocation(SCHEMA_TABLE, key);
    Storage.store({ storagePointer: location, data: schema.unwrap() });

    // Emit an event to notify indexers
    emit StoreCore.MudStoreSetRecord(SCHEMA_TABLE, key, abi.encodePacked(schema.unwrap()));
  }

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  function _setStaticField(
    bytes32 table,
    bytes32[] memory key,
    Schema schema,
    uint8 schemaIndex,
    bytes memory data
  ) internal {
    // verify the value has the correct length for the field
    SchemaType schemaType = schema.atIndex(schemaIndex);
    if (getStaticByteLength(schemaType) != data.length)
      revert StoreCore.StoreCore_InvalidDataLength(getStaticByteLength(schemaType), data.length);

    // Store the provided value in storage
    uint256 location = _getStaticDataLocation(table, key);
    uint256 offset = _getStaticDataOffset(schema, schemaIndex);
    Storage.store({ storagePointer: location, offset: offset, data: data });
  }

  function _setDynamicField(
    bytes32 table,
    bytes32[] memory key,
    Schema schema,
    uint8 schemaIndex,
    bytes memory data
  ) internal {
    uint8 dynamicSchemaIndex = schemaIndex - schema.numStaticFields();

    // Update the dynamic data length
    _setDynamicDataLengthAtIndex(table, key, dynamicSchemaIndex, data.length);

    // Store the provided value in storage
    uint256 dynamicDataLocation = _getDynamicDataLocation(table, key, dynamicSchemaIndex);
    Storage.store({ storagePointer: dynamicDataLocation, data: data });
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/

  /**
   * Get full static record for the given table and key tuple (loading schema's static length from storage)
   */
  function _getStaticData(
    bytes32 table,
    bytes32[] memory key,
    uint256 memoryPointer
  ) internal view {
    Schema schema = _getSchema(table);
    _getStaticData(table, key, schema.staticDataLength(), memoryPointer);
  }

  /**
   * Get full static data for the given table and key tuple, with the given static length
   */
  function _getStaticData(
    bytes32 table,
    bytes32[] memory key,
    uint256 length,
    uint256 memoryPointer
  ) internal view {
    if (length == 0) return;

    // Load the data from storage
    uint256 location = _getStaticDataLocation(table, key);
    Storage.load({ storagePointer: location, length: length, offset: 0, memoryPointer: memoryPointer });
  }

  /**
   * Get a single static field from the given table and key tuple, with the given schema
   */
  function _getStaticField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    Schema schema
  ) internal view returns (bytes memory) {
    // Get the length, storage location and offset of the static field
    SchemaType schemaType = schema.atIndex(schemaIndex);
    uint256 dataLength = getStaticByteLength(schemaType);
    uint256 location = _getStaticDataLocation(table, key);
    uint256 offset = _getStaticDataOffset(schema, schemaIndex);

    // Load the data from storage

    return Storage.load({ storagePointer: location, length: dataLength, offset: offset });
  }

  /**
   * Get a single dynamic field from the given table and key tuple, with the given schema
   */
  function _getDynamicField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    Schema schema
  ) internal view returns (bytes memory) {
    // Get the length and storage location of the dynamic field
    uint8 dynamicSchemaIndex = schemaIndex - schema.numStaticFields();
    uint256 location = _getDynamicDataLocation(table, key, dynamicSchemaIndex);
    uint256 dataLength = _loadEncodedDynamicDataLength(table, key).atIndex(dynamicSchemaIndex);

    return Storage.load({ storagePointer: location, length: dataLength });
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
   * Compute the storage location based on table id and index tuple
   */
  function _getStaticDataLocation(bytes32 table, bytes32[] memory key) internal pure returns (uint256) {
    return uint256(keccak256(abi.encode(SLOT, table, key)));
  }

  /**
   * Get storage offset for the given schema and (static length) index
   */
  function _getStaticDataOffset(Schema schema, uint8 schemaIndex) internal pure returns (uint256) {
    uint256 offset = 0;
    for (uint256 i = 0; i < schemaIndex; i++) {
      offset += getStaticByteLength(schema.atIndex(i));
    }
    return offset;
  }

  /////////////////////////////////////////////////////////////////////////
  //    DYNAMIC DATA
  /////////////////////////////////////////////////////////////////////////

  /**
   * Compute the storage location based on table id and index tuple
   */
  function _getDynamicDataLocation(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex
  ) internal pure returns (uint256) {
    return uint256(keccak256(abi.encode(SLOT, table, key, schemaIndex)));
  }

  /**
   * Compute the storage location for the length of the dynamic data
   */
  function _getDynamicDataLengthLocation(bytes32 table, bytes32[] memory key) internal pure returns (uint256) {
    return uint256(keccak256(abi.encode(SLOT, table, key, "length")));
  }

  /**
   * Get the length of the dynamic data for the given schema and index
   */
  function _loadEncodedDynamicDataLength(bytes32 table, bytes32[] memory key) internal view returns (PackedCounter) {
    // Load dynamic data length from storage
    uint256 dynamicSchemaLengthSlot = _getDynamicDataLengthLocation(table, key);
    return PackedCounter.wrap(Storage.load({ storagePointer: dynamicSchemaLengthSlot }));
  }

  /**
   * Set the length of the dynamic data (in bytes) for the given schema and index
   */
  function _setDynamicDataLengthAtIndex(
    bytes32 table,
    bytes32[] memory key,
    uint8 dynamicSchemaIndex, // schemaIndex - numStaticFields
    uint256 newLengthAtIndex
  ) internal {
    // Load dynamic data length from storage
    uint256 dynamicSchemaLengthSlot = _getDynamicDataLengthLocation(table, key);
    PackedCounter encodedLengths = PackedCounter.wrap(Storage.load({ storagePointer: dynamicSchemaLengthSlot }));

    // Update the encoded lengths
    encodedLengths = encodedLengths.setAtIndex(dynamicSchemaIndex, newLengthAtIndex);

    // Set the new lengths
    Storage.store({ storagePointer: dynamicSchemaLengthSlot, data: encodedLengths.unwrap() });
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
  function getRecord(bytes32 table, bytes32 _key) external view returns (bytes memory) {
    bytes32[] memory key = new bytes32[](1);
    key[0] = _key;
    return StoreCore.getRecord(table, key);
  }

  function getData(bytes32 table, bytes32[2] memory _key) external view returns (bytes memory) {
    bytes32[] memory key = new bytes32[](2);
    key[0] = _key[0];
    key[1] = _key[1];
    return StoreCore.getRecord(table, key);
  }
}
