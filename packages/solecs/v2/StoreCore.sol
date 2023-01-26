// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Utils } from "./Utils.sol";
import { Bytes } from "./Bytes.sol";
import { SchemaType, getStaticByteLength, getElementByteLength } from "./Types.sol";
import { Storage } from "./Storage.sol";
import { Memory } from "./Memory.sol";
import { console } from "forge-std/console.sol";
import "./Buffer.sol";

library StoreCore {
  // note: the preimage of the tuple of keys used to index is part of the event, so it can be used by indexers
  event StoreUpdate(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data);

  bytes32 internal constant SLOT = keccak256("mud.store");
  bytes32 internal constant SCHEMA_TABLE = keccak256("mud.store.table.schema");

  error StoreCore_SchemaTooLong();
  error StoreCore_NotImplemented();
  error StoreCore_InvalidDataLength(uint256 expected, uint256 received);

  /************************************************************************
   *
   *    SCHEMA
   *
   ************************************************************************/

  /**
   * Check if the given table exists
   */
  function hasTable(bytes32 table) internal view returns (bool) {
    // TODO
  }

  /**
   * Register a new table schema
   */
  function registerSchema(bytes32 table, bytes32 schema) internal {
    // TODO: verify the table doesn't already exist
    // TODO: verify the schema is valid (no dynamic elements in static section, etc)
    bytes32[] memory key = new bytes32[](1);
    key[0] = table;
    bytes32 location = _getStaticDataLocation(SCHEMA_TABLE, key);
    Storage.write(location, schema);
  }

  /**
   * Get the schema for the given table
   */
  function getSchema(bytes32 table) internal view returns (bytes32 schema) {
    bytes32[] memory key = new bytes32[](1);
    key[0] = table;
    bytes32 location = _getStaticDataLocation(SCHEMA_TABLE, key);
    return Storage.read(location);
  }

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  /**
   * Set full data record for the given table and key tuple (static and dynamic data)
   */
  function set(
    bytes32 table,
    bytes32[] memory key,
    bytes32 encodedDynamicLength,
    bytes memory data
  ) internal {
    // verify the value has the correct length for the table (based on the table's schema)
    // to prevent invalid data from being stored
    bytes32 schema = getSchema(table);

    // Verify static data length + dynamic data length matches the given data
    uint256 staticLength = _getStaticDataLength(schema);
    uint256 expectedLength = staticLength + _decodeDynamicDataTotalLength(encodedDynamicLength);
    if (expectedLength != data.length) {
      revert StoreCore_InvalidDataLength(expectedLength, data.length);
    }

    // Store the static data at the static data location
    bytes32 staticDataLocation = _getStaticDataLocation(table, key);
    uint256 memoryPointer = Memory.ptr(data);
    Storage.write(staticDataLocation, 0, memoryPointer, staticLength);
    memoryPointer += staticLength; // move the memory pointer to the start of the dynamic data

    // Store the dynamic data length at the dynamic data length location
    bytes32 dynamicDataLengthLocation = _getDynamicDataLengthLocation(table, key);
    Storage.write(dynamicDataLengthLocation, encodedDynamicLength);

    // For every dynamic element, slice off the dynamic data and store it at the dynamic location
    bytes32 dynamicDataLocation;
    uint256 dynamicDataLength;
    for (uint8 i; i < _getNumDynamicFields(schema); ) {
      dynamicDataLocation = _getDynamicDataLocation(table, key, i);
      dynamicDataLength = _decodeDynamicDataLengthAtIndex(encodedDynamicLength, i);
      Storage.write(dynamicDataLocation, 0, memoryPointer, dynamicDataLength);
      memoryPointer += dynamicDataLength; // move the memory pointer to the start of the next dynamic data
      unchecked {
        i++;
      }
    }

    // Emit event to notify indexers
    emit StoreUpdate(table, key, 0, data);
  }

  /**
   * Set full static data record for the given table and key tuple (without any dynamic data)
   */
  function setStaticData(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) internal {
    // verify the value has the correct length for the table (based on the table's schema)
    // to prevent invalid data from being stored
    bytes32 schema = getSchema(table);

    // Verify the static data length matches the table schema
    if (_getStaticDataLength(schema) != data.length) {
      revert StoreCore_InvalidDataLength(_getStaticDataLength(schema), data.length);
    }

    // Store the provided value in storage
    bytes32 location = _getStaticDataLocation(table, key);
    Storage.write(location, data);

    // Emit event to notify indexers
    emit StoreUpdate(table, key, 0, data);
  }

  function setField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data
  ) internal {
    bytes32 schema = getSchema(table);
    if (schemaIndex < _getNumStaticFields(schema)) {
      _setStaticField(table, key, schema, schemaIndex, data);
    } else {
      _setDynamicField(table, key, schema, schemaIndex, data);
    }
  }

  function _setStaticField(
    bytes32 table,
    bytes32[] memory key,
    bytes32 schema,
    uint8 schemaIndex,
    bytes memory data
  ) internal {
    // verify the value has the correct length for the field
    SchemaType schemaType = _getSchemaTypeAtIndex(schema, schemaIndex);
    if (getStaticByteLength(schemaType) != data.length)
      revert StoreCore_InvalidDataLength(getStaticByteLength(schemaType), data.length);

    // Store the provided value in storage
    bytes32 location = _getStaticDataLocation(table, key);
    uint256 offset = _getStaticDataOffset(schema, schemaIndex);
    Storage.write(location, offset, data);

    // Emit event to notify indexers
    emit StoreUpdate(table, key, schemaIndex, data);
  }

  function _setDynamicField(
    bytes32 table,
    bytes32[] memory key,
    bytes32 schema,
    uint8 schemaIndex,
    bytes memory data
  ) internal {
    uint8 dynamicSchemaIndex = schemaIndex - _getNumStaticFields(schema);

    // Update the dynamic data length
    _setDynamicDataLengthAtIndex(table, key, dynamicSchemaIndex, data.length);

    // Store the provided value in storage
    bytes32 dynamicDataLocation = _getDynamicDataLocation(table, key, dynamicSchemaIndex);
    Storage.write(dynamicDataLocation, data);

    // Emit event to notify indexers
    emit StoreUpdate(table, key, schemaIndex, data);
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/

  /**
   * Get full static record for the given table and key tuple (loading schema from storage)
   */
  function get(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    // Get schema for this table
    bytes32 schema = getSchema(table);

    return get(table, key, schema);
  }

  /**
   * Get full data (static and dynamic) for the given table and key tuple, with the given schema
   */
  function get(
    bytes32 table,
    bytes32[] memory key,
    bytes32 schema
  ) internal view returns (bytes memory) {
    // Get static data length
    uint256 staticDataLength = _getStaticDataLength(schema);

    // Load the dynamic data length if there are dynamic fields
    bytes32 encodedDynamicLength;
    uint256 dynamicDataTotalLength;
    uint256 numDynamicFields = _getNumDynamicFields(schema);
    if (numDynamicFields > 0) {
      encodedDynamicLength = _loadEncodedDynamicDataLength(table, key);
      dynamicDataTotalLength = _decodeDynamicDataTotalLength(encodedDynamicLength);
    }

    // Allocate a buffer for the full data (static and dynamic)
    Buffer buffer = Buffer_.allocate(uint128(staticDataLength + dynamicDataTotalLength));

    // Load the static data from storage and append it to the buffer
    buffer.append(getStaticData(table, key, schema));

    // Append dynamic data to the buffer
    for (uint8 i; i < numDynamicFields; i++) {
      uint256 dynamicDataLocation = uint256(_getDynamicDataLocation(table, key, i));
      uint256 dynamicDataLengthAtIndex = _decodeDynamicDataLengthAtIndex(encodedDynamicLength, i);
      Storage.read(dynamicDataLocation, 0, dynamicDataLengthAtIndex, buffer);
    }

    // Return the buffer as bytes
    return buffer.toBytes();
  }

  /**
   * Get full static record for the given table and key tuple (loading schema from storage)
   */
  function getStaticData(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    // Get schema for this table
    bytes32 schema = getSchema(table);

    return getStaticData(table, key, schema);
  }

  /**
   * Get full static data for the given table and key tuple, with the given schema
   */
  function getStaticData(
    bytes32 table,
    bytes32[] memory key,
    bytes32 schema
  ) internal view returns (bytes memory) {
    // Load the data from storage
    bytes32 location = _getStaticDataLocation(table, key);
    return Storage.read(location, _getStaticDataLength(schema));
  }

  // TODO
  function getField(
    bytes32,
    bytes32[] memory,
    uint8
  ) internal pure returns (bytes memory) {
    revert StoreCore_NotImplemented();
  }

  /************************************************************************
   *
   *    HELPER FUNCTIONS
   *
   ************************************************************************/

  /**
   * Encode the given schema into a single bytes32
   * - 2 bytes static length of the schema
   * - 1 byte for number of static size fields
   * - 1 byte for number of dynamic size fields
   * - 28 bytes for 28 schema types
   */
  function encodeSchema(SchemaType[] memory _schema) internal pure returns (bytes32 schema) {
    if (_schema.length > 28) revert StoreCore_SchemaTooLong();
    uint16 length;
    uint8 staticFields;

    // Compute the length of the schema and the number of static fields
    // and store the schema types in the encoded schema
    for (uint256 i = 0; i < _schema.length; ) {
      uint16 staticByteLength = uint16(getStaticByteLength(_schema[i]));
      if (staticByteLength > 0) staticFields++;
      length += staticByteLength;
      schema = Bytes.setBytes1(schema, i + 4, bytes1(uint8(_schema[i])));
      unchecked {
        i++;
      }
    }

    // Store total static length, and number of static and dynamic fields
    schema = Bytes.setBytes1(schema, 0, bytes1(bytes2(length))); // upper length byte
    schema = Bytes.setBytes1(schema, 1, bytes1(uint8(length))); // lower length byte
    schema = Bytes.setBytes1(schema, 2, bytes1(staticFields)); // number of static fields
    schema = Bytes.setBytes1(schema, 3, bytes1(uint8(_schema.length) - staticFields)); // number of dynamic fields
  }

  function encodeDynamicDataLength(uint16[] memory lengths) internal pure returns (bytes32 encodedLength) {
    uint32 totalLength;

    // Compute the total length of the dynamic data
    // and store the encoded lengths of each item
    for (uint256 i; i < lengths.length; ) {
      encodedLength = Bytes.setBytes2(encodedLength, 4 + 2 * i, bytes2(lengths[i]));
      totalLength += lengths[i];
      unchecked {
        i++;
      }
    }

    // Store total length
    encodedLength = Bytes.setBytes4(encodedLength, 0, bytes4(totalLength));
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
   * TODO: provide different overloads for single key and some fixed length array keys for better devex
   */
  function _getStaticDataLocation(bytes32 table, bytes32[] memory key) internal pure returns (bytes32) {
    return keccak256(abi.encode(SLOT, table, key));
  }

  /**
   * Get storage offset for the given schema and (static length) index
   * TODO: gas optimize
   */
  function _getStaticDataOffset(bytes32 schema, uint8 schemaIndex) internal pure returns (uint256) {
    uint256 offset = 0; // skip length
    for (uint256 i = 0; i < schemaIndex; i++) {
      offset += getStaticByteLength(_getSchemaTypeAtIndex(schema, i));
    }
    return offset;
  }

  /**
   * Get the number of static  fields for the given schema
   */
  function _getNumStaticFields(bytes32 schema) internal pure returns (uint8) {
    return uint8(Bytes.slice1(schema, 2));
  }

  /**
   * Get the length of the static data for the given schema
   */
  function _getStaticDataLength(bytes32 schema) internal pure returns (uint256) {
    return uint256(uint16(bytes2(schema)));
  }

  /**
   * Get the type of the data for the given schema at the given index
   */
  function _getSchemaTypeAtIndex(bytes32 schema, uint256 index) internal pure returns (SchemaType) {
    return SchemaType(uint8(Bytes.slice1(schema, index + 4)));
  }

  /////////////////////////////////////////////////////////////////////////
  //    DYNAMIC DATA
  /////////////////////////////////////////////////////////////////////////

  /**
   * Get the number of dynamic length fields for the given schema
   */
  function _getNumDynamicFields(bytes32 schema) internal pure returns (uint8) {
    return uint8(Bytes.slice1(schema, 3));
  }

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
   * TODO: add tests
   */
  function _loadEncodedDynamicDataLength(bytes32 table, bytes32[] memory key) internal view returns (bytes32) {
    // Load dynamic data length from storage
    bytes32 dynamicSchemaLengthSlot = _getDynamicDataLengthLocation(table, key);
    return Storage.read(dynamicSchemaLengthSlot);
  }

  /**
   * Decode the full dynamic data length (in bytes) from the given encoded lengths
   * (first four bytes of encoded lengths)
   */
  function _decodeDynamicDataTotalLength(bytes32 encodedLengths) internal pure returns (uint256) {
    return uint256(uint32(bytes4(encodedLengths)));
  }

  /**
   * Decode the dynamic data length (in bytes) for the given schema and index from the given encoded lengths
   * (two bytes per dynamic schema after the first four bytes)
   */
  function _decodeDynamicDataLengthAtIndex(
    bytes32 encodedLengths,
    uint8 dynamicSchemaIndex // schemaIndex - numStaticFields
  ) internal pure returns (uint256) {
    // Compute dynamic schema index and offset into encoded lengths
    uint256 offset = 4 + dynamicSchemaIndex * 2; // (4 bytes total length, 2 bytes per dynamic schema)

    // Return dynamic data length in bytes for the given index
    return uint256(uint16(Bytes.slice2(encodedLengths, offset)));
  }

  /**
   * Get the total length of the dynamic data (in bytes)
   * (Note: if the length at a specific index is also required, it is recommended to use _loadEncodedDynamicDataLength explicitly)
   */
  function _getDynamicDataTotalLength(bytes32 table, bytes32[] memory key) internal view returns (uint256) {
    // Load dynamic data length from storage
    bytes32 encodedLengths = _loadEncodedDynamicDataLength(table, key);

    // Return dynamic data length in bytes for the given index
    return _decodeDynamicDataTotalLength(encodedLengths);
  }

  /**
   * Get the length of the dynamic data (in bytes) for the given schema and index
   * (Note: if the total length is also required, it is recommended to use _loadEncodedDynamicDataLength explicitly)
   */
  function _getDynamicDataLengthAtIndex(
    bytes32 table,
    bytes32[] memory key,
    uint8 dynamicSchemaIndex // schemaIndex - numStaticFields
  ) internal view returns (uint256) {
    // Load dynamic data length from storage
    bytes32 encodedLengths = _loadEncodedDynamicDataLength(table, key);

    // Return dynamic data length in bytes for the given index
    return _decodeDynamicDataLengthAtIndex(encodedLengths, dynamicSchemaIndex);
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
    bytes32 encodedLengths = Storage.read(dynamicSchemaLengthSlot);

    // Get current lengths (total and at index)
    uint256 totalLength = _decodeDynamicDataTotalLength(encodedLengths);
    uint256 currentLengthAtIndex = _decodeDynamicDataLengthAtIndex(encodedLengths, dynamicSchemaIndex);

    // Compute the difference and update the total length
    int256 lengthDiff = int256(newLengthAtIndex) - int256(currentLengthAtIndex);
    totalLength = uint256(int256(totalLength) + lengthDiff);

    // Compute dynamic schema index and offset into encoded lengths
    uint256 offset = 4 + dynamicSchemaIndex * 2; // (4 bytes total length, 2 bytes per dynamic schema)

    // Encode the new lengths
    encodedLengths = Bytes.setBytes4(encodedLengths, 0, bytes4(uint32(totalLength)));

    encodedLengths = Bytes.setBytes2(encodedLengths, offset, bytes2(uint16(newLengthAtIndex)));

    // Set the new lengths
    Storage.write(dynamicSchemaLengthSlot, encodedLengths);
  }
}

// Overloads for single key and some fixed length array keys for better devex
library StoreCoreExt {
  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  function setStaticData(
    bytes32 table,
    bytes32 _key,
    bytes memory data
  ) internal {
    bytes32[] memory key = new bytes32[](1);
    key[0] = _key;
    StoreCore.setStaticData(table, key, data);
  }

  function setStaticData(
    bytes32 table,
    bytes32[2] memory _key,
    bytes memory data
  ) internal {
    bytes32[] memory key = new bytes32[](2);
    key[0] = _key[0];
    key[1] = _key[1];
    StoreCore.setStaticData(table, key, data);
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/
  function get(bytes32 table, bytes32 _key) external view returns (bytes memory) {
    bytes32[] memory key = new bytes32[](1);
    key[0] = _key;
    return StoreCore.get(table, key);
  }

  function getData(bytes32 table, bytes32[2] memory _key) external view returns (bytes memory) {
    bytes32[] memory key = new bytes32[](2);
    key[0] = _key[0];
    key[1] = _key[1];
    return StoreCore.get(table, key);
  }
}
