// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Utils } from "./Utils.sol";
import { Bytes } from "./Bytes.sol";
import { SchemaType, getStaticByteLength, getElementByteLength } from "./Types.sol";
import { Storage } from "./Storage.sol";
import { Memory } from "./Memory.sol";
import { console } from "forge-std/console.sol";
import { Schema } from "./Schema.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { Buffer, Buffer_ } from "./Buffer.sol";
import { HooksTable, tableId as HooksTableId } from "./tables/HooksTable.sol";
import { IStoreHook } from "./IStore.sol";

// TODO
// - Turn all storage pointer to uint256 for consistency (uint256 is better than bytes32 because it's easier to do arithmetic on)
// - Change Storage library functions to make it clearer which argument is offset and which is length
// - Streamline naming in Storage and Memory libraries (probably just use load and store instead of read and write?)
// - Move all internal functions to a separate StoreCoreInternal library to discourage using it

library StoreCore {
  // note: the preimage of the tuple of keys used to index is part of the event, so it can be used by indexers
  event MudStoreSetRecord(bytes32 table, bytes32[] key, bytes data);
  event MudStoreSetField(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data);
  event MudStoreDeleteRecord(bytes32 table, bytes32[] key);

  bytes32 internal constant SLOT = keccak256("mud.store");
  bytes32 internal constant SCHEMA_TABLE = keccak256("mud.store.table.schema");

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
    _registerSchemaUnchecked(table, schema);
  }

  /**
   * Register a new table schema without validity checks
   */
  function _registerSchemaUnchecked(bytes32 table, Schema schema) internal {
    bytes32[] memory key = new bytes32[](1);
    key[0] = table;
    bytes32 location = _getStaticDataLocation(SCHEMA_TABLE, key);
    Storage.write(location, schema.unwrap());
  }

  /**
   * Get the schema for the given table
   */
  function getSchema(bytes32 table) internal view returns (Schema schema) {
    bytes32[] memory key = new bytes32[](1);
    key[0] = table;
    bytes32 location = _getStaticDataLocation(SCHEMA_TABLE, key);
    return Schema.wrap(Storage.read(location));
  }

  /************************************************************************
   *
   *    REGISTER HOOKS
   *
   ************************************************************************/

  /*
   * Register hooks to be called when a record or field is set or deleted
   */
  function registerHook(bytes32 table, IStoreHook hooks) external {
    HooksTable.push(table, address(hooks));
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

    // Call onSetRecord hooks (before actually modifying the state, so observers have access to the previous state if needed)
    address[] memory hooks = HooksTable.get(table);
    for (uint256 i = 0; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onSetRecord(table, key, data);
    }

    // Store the static data at the static data location
    bytes32 staticDataLocation = _getStaticDataLocation(table, key);
    uint256 memoryPointer = Memory.dataPointer(data);
    Storage.write(staticDataLocation, 0, memoryPointer, staticLength);
    memoryPointer += staticLength + 32; // move the memory pointer to the start of the dynamic data (skip the encoded dynamic length)

    // If there is no dynamic data, we're done
    if (schema.numDynamicFields() == 0) return;

    // Store the dynamic data length at the dynamic data length location
    bytes32 dynamicDataLengthLocation = _getDynamicDataLengthLocation(table, key);
    Storage.write(dynamicDataLengthLocation, dynamicLength.unwrap());

    // For every dynamic element, slice off the dynamic data and store it at the dynamic location
    bytes32 dynamicDataLocation;
    uint256 dynamicDataLength;
    for (uint8 i; i < schema.numDynamicFields(); ) {
      dynamicDataLocation = _getDynamicDataLocation(table, key, i);
      dynamicDataLength = dynamicLength.atIndex(i);
      Storage.write(dynamicDataLocation, 0, memoryPointer, dynamicDataLength);
      memoryPointer += dynamicDataLength; // move the memory pointer to the start of the next dynamic data
      unchecked {
        i++;
      }
    }

    // Emit event to notify indexers
    emit MudStoreSetRecord(table, key, data);
  }

  function setField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data
  ) internal {
    Schema schema = getSchema(table);

    // Call onSetField hooks (before actually modifying the state, so observers have access to the previous state if needed)
    address[] memory hooks = HooksTable.get(table);
    for (uint256 i = 0; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onSetField(table, key, schemaIndex, data);
    }

    if (schemaIndex < schema.numStaticFields()) {
      _setStaticField(table, key, schema, schemaIndex, data);
    } else {
      _setDynamicField(table, key, schema, schemaIndex, data);
    }

    // Emit event to notify indexers
    emit MudStoreSetField(table, key, schemaIndex, data);
  }

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
      revert StoreCore_InvalidDataLength(getStaticByteLength(schemaType), data.length);

    // Store the provided value in storage
    bytes32 location = _getStaticDataLocation(table, key);
    uint256 offset = _getStaticDataOffset(schema, schemaIndex);
    Storage.write(location, offset, data);
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
    bytes32 dynamicDataLocation = _getDynamicDataLocation(table, key, dynamicSchemaIndex);
    Storage.write(dynamicDataLocation, data);
  }

  function deleteRecord(bytes32 table, bytes32[] memory key) internal {
    // Get schema for this table
    Schema schema = getSchema(table);

    // Call onDeleteRecord hooks (before actually modifying the state, so observers have access to the previous state if needed)
    address[] memory hooks = HooksTable.get(table);
    for (uint256 i = 0; i < hooks.length; i++) {
      IStoreHook hook = IStoreHook(hooks[i]);
      hook.onDeleteRecord(table, key);
    }

    // Delete static data
    bytes32 staticDataLocation = _getStaticDataLocation(table, key);
    Storage.write(staticDataLocation, 0, new bytes(schema.staticDataLength()));

    // If there are no dynamic fields, we're done
    if (schema.numDynamicFields() == 0) return;

    // Delete dynamic data
    bytes32 dynamicDataLocation;
    PackedCounter encodedLengths = _loadEncodedDynamicDataLength(table, key);
    for (uint8 i; i < schema.numDynamicFields(); ) {
      dynamicDataLocation = _getDynamicDataLocation(table, key, i);
      Storage.write(dynamicDataLocation, 0, new bytes(encodedLengths.atIndex(i)));
      unchecked {
        i++;
      }
    }

    // Delete dynamic data length
    bytes32 dynamicDataLengthLocation = _getDynamicDataLengthLocation(table, key);
    Storage.write(dynamicDataLengthLocation, bytes32(0));

    // Emit event to notify indexers
    emit MudStoreDeleteRecord(table, key);
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/

  /**
   * Get full static record for the given table and key tuple (loading schema from storage)
   */
  function getRecord(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    // Get schema for this table
    Schema schema = getSchema(table);
    if (schema.isEmpty()) revert StoreCore_TableNotFound(table);

    return getRecord(table, key, schema);
  }

  /**
   * Get full data (static and dynamic) for the given table and key tuple, with the given schema
   */
  function getRecord(
    bytes32 table,
    bytes32[] memory key,
    Schema schema
  ) internal view returns (bytes memory) {
    // Get the static data length
    uint256 outputLength = schema.staticDataLength();

    // Load the dynamic data length if there are dynamic fields
    PackedCounter dynamicDataLength;
    uint256 numDynamicFields = schema.numDynamicFields();
    if (numDynamicFields > 0) {
      dynamicDataLength = _loadEncodedDynamicDataLength(table, key);
      outputLength += 32 + dynamicDataLength.total(); // encoded length + data
    }

    // Allocate a buffer for the full data (static and dynamic)
    Buffer buffer = Buffer_.allocate(uint128(outputLength));

    // Load the static data from storage and append it to the buffer
    buffer.append(getStaticData(table, key, schema));

    // Early return if there are no dynamic fields
    if (dynamicDataLength.total() == 0) return buffer.toBytes();

    // Append the encoded dynamic length to the buffer after the static data
    buffer.append(dynamicDataLength.unwrap());

    // Append dynamic data to the buffer
    for (uint8 i; i < numDynamicFields; i++) {
      uint256 dynamicDataLocation = uint256(_getDynamicDataLocation(table, key, i));
      Storage.read(dynamicDataLocation, 0, dynamicDataLength.atIndex(i), buffer);
    }

    // Return the buffer as bytes
    return buffer.toBytes();
  }

  /**
   * Get full static record for the given table and key tuple (loading schema from storage)
   */
  function getStaticData(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    Schema schema = getSchema(table);
    return getStaticData(table, key, schema);
  }

  /**
   * Get full static data for the given table and key tuple, with the given schema
   */
  function getStaticData(
    bytes32 table,
    bytes32[] memory key,
    Schema schema
  ) internal view returns (bytes memory) {
    if (schema.staticDataLength() == 0) return new bytes(0);

    // Load the data from storage
    bytes32 location = _getStaticDataLocation(table, key);
    return Storage.read(location, schema.staticDataLength());
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
      return _getStaticField(table, key, schemaIndex, schema);
    } else {
      return _getDynamicField(table, key, schemaIndex, schema);
    }
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
    uint256 location = uint256(_getStaticDataLocation(table, key));
    uint256 offset = _getStaticDataOffset(schema, schemaIndex);

    // Load the data from storage

    return Storage.read(location, offset, dataLength);
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
    bytes32 location = _getDynamicDataLocation(table, key, dynamicSchemaIndex);
    uint256 dataLength = _loadEncodedDynamicDataLength(table, key).atIndex(dynamicSchemaIndex);

    return Storage.read(location, dataLength);
  }

  /************************************************************************
   *
   *    INTERNAL HELPER FUNCTIONS
   *
   ************************************************************************/

  /////////////////////////////////////////////////////////////////////////
  //    STATIC DATA
  /////////////////////////////////////////////////////////////////////////

  /**
   * Compute the storage location based on table id and index tuple
   */
  function _getStaticDataLocation(bytes32 table, bytes32[] memory key) internal pure returns (bytes32) {
    return keccak256(abi.encode(SLOT, table, key));
  }

  /**
   * Get storage offset for the given schema and (static length) index
   */
  function _getStaticDataOffset(Schema schema, uint8 schemaIndex) internal pure returns (uint256) {
    uint256 offset = 0; // skip length
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
  ) internal pure returns (bytes32) {
    return keccak256(abi.encode(SLOT, table, key, schemaIndex));
  }

  /**
   * Compute the storage location for the length of the dynamic data
   */
  function _getDynamicDataLengthLocation(bytes32 table, bytes32[] memory key) internal pure returns (bytes32) {
    return keccak256(abi.encode(SLOT, table, key, "length"));
  }

  /**
   * Get the length of the dynamic data for the given schema and index
   */
  function _loadEncodedDynamicDataLength(bytes32 table, bytes32[] memory key) internal view returns (PackedCounter) {
    // Load dynamic data length from storage
    bytes32 dynamicSchemaLengthSlot = _getDynamicDataLengthLocation(table, key);
    return PackedCounter.wrap(Storage.read(dynamicSchemaLengthSlot));
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
    bytes32 dynamicSchemaLengthSlot = _getDynamicDataLengthLocation(table, key);
    PackedCounter encodedLengths = PackedCounter.wrap(Storage.read(dynamicSchemaLengthSlot));

    // Update the encoded lengths
    encodedLengths = encodedLengths.setAtIndex(dynamicSchemaIndex, newLengthAtIndex);

    // Set the new lengths
    Storage.write(dynamicSchemaLengthSlot, encodedLengths.unwrap());
  }
}

// Overloads for single key and some fixed length array keys for better devex
library StoreCoreExt {
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
