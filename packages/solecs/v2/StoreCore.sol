// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Utils } from "./Utils.sol";
import { Bytes } from "./Bytes.sol";
import { SchemaType, getStaticByteLength } from "./Types.sol";
import { Storage } from "./Storage.sol";
import { console } from "forge-std/console.sol";
import "./Buffer.sol";

library StoreCore {
  // note: the preimage of the tuple of keys used to index is part of the event, so it can be used by indexers
  event StoreUpdate(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data);

  bytes32 constant _slot = keccak256("mud.store");
  bytes32 constant _schemaTable = keccak256("mud.store.table.schema");

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
    bytes32[] memory key = new bytes32[](1);
    key[0] = table;
    bytes32 location = _getStaticDataLocation(_schemaTable, key);
    Storage.write(location, schema);
  }

  /**
   * Get the schema for the given table
   */
  function getSchema(bytes32 table) internal view returns (bytes32 schema) {
    bytes32[] memory key = new bytes32[](1);
    key[0] = table;
    bytes32 location = _getStaticDataLocation(_schemaTable, key);
    return Storage.read(location);
  }

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  /**
   * Set full record for the given table and key tuple
   * (Note: this will overwrite the entire record, including any array data)
   */
  function set(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) internal {
    // verify the value has the correct length for the table (based on the table's schema)
    // to prevent invalid data from being stored
    bytes32 schema = getSchema(table);
    if (_getStaticDataLength(schema) != data.length)
      revert StoreCore_InvalidDataLength(_getStaticDataLength(schema), data.length);

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
    // verify the value has the correct length for the field
    bytes32 schema = getSchema(table);
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

  function setArrayIndex(
    bytes32,
    bytes32[] memory,
    uint16,
    bytes memory
  ) internal pure {
    revert StoreCore_NotImplemented();
  }

  function setArrayIndexField(
    bytes32,
    bytes32[] memory,
    uint16,
    uint8,
    bytes memory
  ) internal pure {
    revert StoreCore_NotImplemented();
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/

  /**
   * Get full record for the given table and key tuple (compute length from schema)
   */
  function get(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    // Get schema for this table
    bytes32 schema = getSchema(table);

    return get(table, key, schema);
  }

  function getField(
    bytes32,
    bytes32[] memory,
    uint8
  ) internal pure returns (bytes memory) {
    revert StoreCore_NotImplemented();
  }

  function getArrayIndex(
    bytes32,
    bytes32[] memory,
    uint16
  ) internal pure returns (bytes memory) {
    revert StoreCore_NotImplemented();
  }

  function getArrayIndexField(
    bytes32,
    bytes32[] memory,
    uint16,
    uint8
  ) internal pure returns (bytes memory) {
    revert StoreCore_NotImplemented();
  }

  /**
   * Get full data for the given table and key tuple, with the given length
   */
  function get(
    bytes32 table,
    bytes32[] memory key,
    bytes32 schema
  ) internal view returns (bytes memory) {
    // Load the data from storage
    bytes32 location = _getStaticDataLocation(table, key);
    return Storage.read(location, _getStaticDataLength(schema));
  }

  /************************************************************************
   *
   *    HELPER FUNCTIONS
   *
   ************************************************************************/

  /**
   * Encode the given schema into a single bytes32
   * - The first two bytes are the static length of the schema
   * - The third byte is the number of static size fields
   * - The fourth byte is the number of dynamic size fields
   * - The remaining bytes are the schema types
   */
  function encodeSchema(SchemaType[] memory _schema) internal pure returns (bytes32) {
    if (_schema.length > 28) revert StoreCore_SchemaTooLong();
    uint16 length;
    uint8 staticFields;
    bytes memory schema = new bytes(32);

    for (uint256 i = 0; i < _schema.length; i++) {
      uint16 staticByteLength = uint16(getStaticByteLength(_schema[i]));
      if (staticByteLength > 0) staticFields++;
      length += staticByteLength;

      schema[i + 4] = bytes1(uint8(_schema[i]));
    }

    schema[0] = bytes1(bytes2(length)); // upper length byte
    schema[1] = bytes1(uint8(length)); // lower length byte
    schema[2] = bytes1(staticFields); // number of static fields
    schema[3] = bytes1(uint8(_schema.length) - staticFields); // number of dynamic fields

    return bytes32(schema);
  }

  /************************************************************************
   *
   *    INTERNAL HELPER FUNCTIONS
   *
   ************************************************************************/

  /**
   * Compute the storage location based on table id and index tuple
   * TODO: provide different overloads for single key and some fixed length array keys for better devex
   */
  function _getStaticDataLocation(bytes32 table, bytes32[] memory key) internal pure returns (bytes32) {
    return keccak256(abi.encode(_slot, table, key));
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
   * Get the length of the static data for the given schema
   */
  function _getStaticDataLength(bytes32 schema) internal pure returns (uint256) {
    return uint256(uint16(bytes2(schema)));
  }

  /**
   * Get the number of static  fields for the given schema
   */
  function _getNumStaticFields(bytes32 schema) internal pure returns (uint8) {
    return uint8(Bytes.slice1(schema, 2));
  }

  /**
   * Get the number of variable fields for the given schema
   */
  function _getNumDynamicFields(bytes32 schema) internal pure returns (uint8) {
    return uint8(Bytes.slice1(schema, 3));
  }

  /**
   * Get the type of the data for the given schema at the given index
   */
  function _getSchemaTypeAtIndex(bytes32 schema, uint256 index) internal pure returns (SchemaType) {
    return SchemaType(uint8(Bytes.slice1(schema, index + 4)));
  }
}

// Overloads for single key and some fixed length array keys for better devex
library StoreCoreExt {
  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  function set(
    bytes32 table,
    bytes32 _key,
    bytes memory data
  ) internal {
    bytes32[] memory key = new bytes32[](1);
    key[0] = _key;
    StoreCore.set(table, key, data);
  }

  function set(
    bytes32 table,
    bytes32[2] memory _key,
    bytes memory data
  ) internal {
    bytes32[] memory key = new bytes32[](2);
    key[0] = _key[0];
    key[1] = _key[1];
    StoreCore.set(table, key, data);
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
