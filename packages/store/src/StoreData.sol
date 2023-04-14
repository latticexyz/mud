// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreData, IStoreHook } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";

abstract contract StoreData is IStoreData {
  constructor() {
    StoreCore.initialize();
  }

  function getSchema(bytes32 table) public view virtual returns (Schema schema) {
    schema = StoreCore.getSchema(table);
  }

  function getKeySchema(bytes32 table) public view virtual returns (Schema schema) {
    schema = StoreCore.getKeySchema(table);
  }

  // Get full record (static and dynamic data, load schema from storage)
  function getRecord(bytes32 table, bytes32[] calldata key) public view virtual returns (bytes memory data) {
    data = StoreCore.getRecord(table, key);
  }

  // Get full record (static and dynamic data)
  function getRecord(
    bytes32 table,
    bytes32[] calldata key,
    Schema schema
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getRecord(table, key, schema);
  }

  // Get partial data at schema index
  function getField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getField(table, key, schemaIndex);
  }

  function isStore() public view {}
}
