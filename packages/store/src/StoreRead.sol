// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreRead } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";

contract StoreRead is IStoreRead {
  constructor() {
    StoreCore.initialize();
  }

  function getSchema(bytes32 table) public view virtual returns (Schema schema) {
    schema = StoreCore.getSchema(table);
  }

  function getKeySchema(bytes32 table) public view virtual returns (Schema schema) {
    schema = StoreCore.getKeySchema(table);
  }

  // Get full record (static and dynamic data)
  function getRecord(
    bytes32 table,
    bytes32[] calldata key,
    Schema valueSchema
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getRecord(table, key, valueSchema);
  }

  // Get partial data at schema index
  function getField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    Schema valueSchema
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getField(table, key, schemaIndex, valueSchema);
  }

  function getFieldLength(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    Schema schema
  ) public view virtual returns (uint256) {
    return StoreCore.getFieldLength(tableId, key, schemaIndex, schema);
  }

  function getFieldSlice(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    Schema schema,
    uint256 start,
    uint256 end
  ) public view virtual returns (bytes memory) {
    return StoreCore.getFieldSlice(tableId, key, schemaIndex, schema, start, end);
  }
}
