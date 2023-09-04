// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreRead } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { Schema } from "./Schema.sol";

contract StoreRead is IStoreRead {
  constructor() {
    StoreCore.initialize();
  }

  function getFieldLayout(bytes32 table) public view virtual returns (FieldLayout fieldLayout) {
    fieldLayout = StoreCore.getFieldLayout(table);
  }

  function getValueSchema(bytes32 table) public view virtual returns (Schema schema) {
    schema = StoreCore.getValueSchema(table);
  }

  function getKeySchema(bytes32 table) public view virtual returns (Schema schema) {
    schema = StoreCore.getKeySchema(table);
  }

  // Get full record (static and dynamic data)
  function getRecord(
    bytes32 table,
    bytes32[] calldata key,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getRecord(table, key, fieldLayout);
  }

  // Get partial data at schema index
  function getField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getField(table, key, schemaIndex, fieldLayout);
  }

  function getFieldLength(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (uint256) {
    return StoreCore.getFieldLength(tableId, key, schemaIndex, fieldLayout);
  }

  function getFieldSlice(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    FieldLayout fieldLayout,
    uint256 start,
    uint256 end
  ) public view virtual returns (bytes memory) {
    return StoreCore.getFieldSlice(tableId, key, schemaIndex, fieldLayout, start, end);
  }
}
