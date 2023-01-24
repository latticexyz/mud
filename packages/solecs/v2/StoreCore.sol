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
    if (schema.length > 32) revert StoreCore_SchemaTooLong();
    bytes32[] memory key = new bytes32[](1);
    key[0] = table;
    bytes32 location = _getLocation(_schemaTable, key);
    _setDataRaw(location, bytes.concat(schema));
  }

  /**
   * Get the schema for the given table
   */
  function getSchema(bytes32 table) internal view returns (bytes32 schema) {
    bytes32[] memory key = new bytes32[](1);
    key[0] = table;
    bytes32 location = _getLocation(_schemaTable, key);
    bytes memory blob = _getDataRaw(location, 32);
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
    // TODO: verify the value has the correct length for the table (based on the table's schema)
    // (Tradeoff, slightly higher cost due to additional sload, but higher security - library could also provide both options)

    // Store the provided value in storage
    bytes32 location = _getLocation(table, key);
    _setDataRaw(location, data);

    // Emit event to notify indexers
    emit StoreUpdate(table, key, 0, 0, data);
  }

  function setField(
    bytes32,
    bytes32[] memory,
    uint8,
    bytes memory
  ) internal pure {
    revert StoreCore_NotImplemented();
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

    // Compute length of the full schema
    uint256 length = _getSchemaLength(schema);

    return getData(table, key, length);
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
  function getData(
    bytes32 table,
    bytes32[] memory key,
    uint256 length
  ) internal view returns (bytes memory) {
    // Load the data from storage
    bytes32 location = _getLocation(table, key);
    return _getDataRaw(location, length);
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

  /**
   * Write raw bytes to storage at the given location
   */
  function _setDataRaw(bytes32 location, bytes memory data) internal {
    assembly {
      // loop over data and sstore it, starting at `location`
      // (don't store length, since it is known from the schema)
      for {
        let i := 0
      } lt(i, mload(data)) {
        i := add(i, 0x20) // increment by 32 since we are storing 32 bytes at a time
      } {
        sstore(add(location, i), mload(add(data, add(0x20, i))))
      }
    }
  }

  /**
   * Read raw bytes from storage at the given location and length in bytess
   */
  function _getDataRaw(bytes32 location, uint256 length) internal view returns (bytes memory data) {
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
  }

  /**
   * Get the length of the data for the given schema
   */
  function _getSchemaLength(bytes32 schema) internal pure returns (uint256) {
    return uint256(uint16(bytes2(schema)));
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
