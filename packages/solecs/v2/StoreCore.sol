// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Utils } from "./Utils.sol";
import { Bytes } from "./Bytes.sol";
import { SchemaType } from "./Types.sol";
import { console } from "forge-std/console.sol";

library StoreCore {
  // note: the preimage of the tuple of keys used to index is part of the event, so it can be used by indexers
  event StoreUpdate(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data);
  bytes32 constant _slot = keccak256("mud.store");
  bytes32 constant _schemaTable = keccak256("mud.store.table.schema");

  error StoreCore_SchemaTooLong();

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
  function registerSchema(bytes32 table, SchemaType[] memory schema) internal {
    // TODO: verify the table doesn't already exist
    if (schema.length > 32) revert StoreCore_SchemaTooLong();
    bytes32 location = _getLocation(_schemaTable, table);
    _setDataRaw(location, Bytes.from(schema));
  }

  /**
   * Get the schema for the given table
   */
  function getSchema(bytes32 table) internal view returns (SchemaType[] memory schema) {
    bytes32 location = _getLocation(_schemaTable, table);
    bytes memory blob = _getDataRaw(location, 32);

    // Find the first `None` value in the schema to determine the length
    uint256 length = 0;
    while (length < 32 && blob[length] != bytes1(uint8(SchemaType.None))) {
      length++;
    }

    // Decrease the blob size to the actual length
    Bytes.setLengthInPlace(blob, length);
    schema = Bytes.toSchemaTypeArray(blob);
  }

  /************************************************************************
   *
   *    SET DATA
   *
   ************************************************************************/

  /**
   * Set data for the given table and key tuple
   */
  function setData(
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
    emit StoreUpdate(table, key, 0, data);
  }

  /**
   * Set data for the given table and single key
   */
  function setData(
    bytes32 table,
    bytes32 key,
    bytes memory data
  ) internal {
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = key;
    setData(table, keyTuple, data);
  }

  /************************************************************************
   *
   *    GET DATA
   *
   ************************************************************************/

  /**
   * Get full data for the given table and key tuple (compute length from schema)
   */
  function getData(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    // Get schema for this table
    SchemaType[] memory schema = getSchema(table);

    // Compute length of the full schema
    uint256 length = _getByteLength(schema);

    return getData(table, key, length);
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

  function getData(bytes32 table, bytes32 key) internal view returns (bytes memory) {
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = key;
    return getData(table, keyTuple);
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
  function _getLocation(bytes32 table, bytes32[] memory key) internal pure returns (bytes32) {
    return keccak256(abi.encode(_slot, table, key));
  }

  function _getLocation(bytes32 table, bytes32 key) internal pure returns (bytes32) {
    bytes32[] memory keyTuple = new bytes32[](1);
    keyTuple[0] = key;
    return _getLocation(table, keyTuple);
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
   * Get the length of the data for the given schema type
   * (Because Solidity doesn't support constant arrays, we need to use a function)
   * TODO: add more types
   */
  function _getByteLength(SchemaType schemaType) internal pure returns (uint256) {
    if (schemaType == SchemaType.Uint8) {
      return 1;
    } else if (schemaType == SchemaType.Uint16) {
      return 2;
    } else {
      revert("Unsupported schema type");
    }
  }

  /**
   * Get the length of the data for the given schema
   */
  function _getByteLength(SchemaType[] memory schema) internal pure returns (uint256) {
    uint256 length = 0;
    for (uint256 i = 0; i < schema.length; ) {
      length += _getByteLength(schema[i]);
      unchecked {
        i++;
      }
    }
    return length;
  }

  /**
   * Split the given bytes blob into an array of bytes based on the given schema
   */
  function _split(bytes memory blob, SchemaType[] memory schema) internal pure returns (bytes[] memory) {
    uint256[] memory lengths = new uint256[](schema.length);
    for (uint256 i = 0; i < schema.length; ) {
      lengths[i] = _getByteLength(schema[i]);
      unchecked {
        i++;
      }
    }
    return Bytes.split(blob, lengths);
  }
}
