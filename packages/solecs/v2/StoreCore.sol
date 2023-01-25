// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Utils } from "./Utils.sol";
import { Bytes } from "./Bytes.sol";
import { SchemaType, getByteLength } from "./Types.sol";
import { console } from "forge-std/console.sol";

library StoreCore {
  // note: the preimage of the tuple of keys used to index is part of the event, so it can be used by indexers
  event StoreUpdate(bytes32 table, bytes32[] key, uint16 arrayIndex, uint8 fieldIndex, bytes data);

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
    bytes32 location = _getLocation(_schemaTable, key);
    _setDataUnchecked(location, 0, bytes.concat(schema));
  }

  /**
   * Get the schema for the given table
   */
  function getSchema(bytes32 table) internal view returns (bytes32 schema) {
    bytes32[] memory key = new bytes32[](1);
    key[0] = table;
    bytes32 location = _getLocation(_schemaTable, key);
    bytes memory blob = _getDataUnchecked(location, 32);
    return bytes32(blob);
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
    if (_getSchemaLength(schema) != data.length)
      revert StoreCore_InvalidDataLength(_getSchemaLength(schema), data.length);

    // Store the provided value in storage
    bytes32 location = _getLocation(table, key);
    _setDataUnchecked(location, 0, data);

    // Emit event to notify indexers
    emit StoreUpdate(table, key, 0, 0, data);
  }

  function setField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    bytes memory data
  ) internal {
    // verify the value has the correct length for the field
    bytes32 schema = getSchema(table);
    SchemaType schemaType = _getSchemaTypeAtIndex(schema, fieldIndex);
    if (getByteLength(schemaType) != data.length)
      revert StoreCore_InvalidDataLength(getByteLength(schemaType), data.length);

    // Store the provided value in storage
    bytes32 location = _getLocation(table, key);
    uint256 offset = _getDataOffset(schema, fieldIndex);
    _setDataUnchecked(location, offset, data);

    // Emit event to notify indexers
    emit StoreUpdate(table, key, 0, 0, data);
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
    bytes32 location = _getLocation(table, key);
    return _getDataUnchecked(location, _getSchemaLength(schema));
  }

  /************************************************************************
   *
   *    HELPER FUNCTIONS
   *
   ************************************************************************/

  /************************************************************************
   *
   *    INTERNAL HELPER FUNCTIONS
   *
   ************************************************************************/

  /**
   * Compute the storage location based on table id and index tuple
   * TODO: provide different overloads for single key and some fixed length array keys for better devex
   */
  function _getLocation(bytes32 table, bytes32[] memory key) internal pure returns (bytes32) {
    return keccak256(abi.encode(_slot, table, key));
  }

  function _setFullWord(bytes32 location, bytes32 data) internal {
    assembly {
      sstore(location, data)
    }
  }

  function _setPartialWord(
    bytes32 location,
    uint256 offset, // in bytes
    uint256 length, // in bytes
    bytes32 data
  ) internal {
    bytes32 current;
    assembly {
      current := sload(location)
    }
    bytes32 mask = bytes32(((1 << (length * 8)) - 1) << (256 - length * 8 - offset * 8)); // create a mask for the bits we want to update
    console.logBytes32(mask);
    bytes32 updated = (current & ~mask) | ((data >> (offset * 8)) & mask); // apply mask to data
    console.logBytes32(updated);
    assembly {
      sstore(location, updated)
    }
  }

  /**
   * Write raw bytes to storage at the given location
   * TODO: this implementation is optimized for readability, but not very gas efficient. We should optimize this using assembly once we've settled on a spec.
   */
  function _setDataUnchecked(
    bytes32 location,
    uint256 offset,
    bytes memory data
  ) internal {
    uint256 numWords = Utils.divCeil(data.length, 32);

    for (uint256 i; i < numWords; i++) {
      // If this is the first word, and there is an offset, apply a mask to beginning
      if ((i == 0 && offset > 0)) {
        _setPartialWord(
          location, // the word to update
          offset, // the offset in bytes to start writing
          data.length > 32 ? 32 - offset : data.length, // the number of bytes to write
          bytes32(data)
        );

        // If this is the last word, and there is a partial word, apply a mask to the end
      } else if (i == numWords - 1 && data.length % 32 > 0) {
        _setPartialWord(
          bytes32(uint256(location) + i * 32), // the word to update
          0, // the offset in bytes to start writing
          data.length % 32, // the number of bytes to write
          Bytes.slice32(data, i * 32) // the data to write
        );

        // Otherwise, just write the word
      } else {
        _setFullWord(bytes32(uint256(location) + i * 32), Bytes.slice32(data, i * 32));
      }
    }
  }

  /**
   * Read raw bytes from storage at the given location and length in bytess
   * TODO: implement offset
   */
  function _getDataUnchecked(bytes32 location, uint256 length) internal view returns (bytes memory data) {
    data = new bytes(length);
    // load data from storage into memory
    assembly {
      for {
        let i := 0
      } lt(i, length) {
        i := add(i, 0x20) // increment by 32 since we are loading 32 bytes at a time
      } {
        mstore(add(data, add(0x20, i)), sload(add(location, i)))
      }
    }

    // remove offset

    // remove unused trailing data
  }

  /**
   * Get the length of the data for the given schema
   */
  function _getSchemaLength(bytes32 schema) internal pure returns (uint256) {
    return uint256(uint16(bytes2(schema)));
  }

  /**
   * Get the offset of the data for the given schema at the given index
   * TODO: gas optimize
   */
  function _getDataOffset(bytes32 schema, uint8 fieldIndex) internal pure returns (uint256) {
    uint256 offset = 2; // skip length
    for (uint256 i = 0; i < fieldIndex; i++) {
      offset += getByteLength(_getSchemaTypeAtIndex(schema, i));
    }
    return offset;
  }

  /**
   * Get the type of the data for the given schema at the given index
   */
  function _getSchemaTypeAtIndex(bytes32 schema, uint256 index) internal pure returns (SchemaType) {
    return SchemaType(uint8(Bytes.slice1(schema, index + 2)));
  }

  /**
   * Encode the given schema into a single bytes32
   * TODO: gas optimize, replace bytes.concat with Buffer
   */
  function _encodeSchema(SchemaType[] memory _schema) internal pure returns (bytes32) {
    if (_schema.length > 30) revert StoreCore_SchemaTooLong();
    uint16 length;
    bytes memory schema;

    for (uint256 i = 0; i < _schema.length; i++) {
      length += uint16(getByteLength(_schema[i]));
      schema = bytes.concat(schema, bytes1(uint8(_schema[i])));
    }

    return bytes32(bytes.concat(bytes2(length), schema));
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
