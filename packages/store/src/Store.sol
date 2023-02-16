// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";
import { IStore, IStoreHook } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";

abstract contract Store is IStore {
  constructor() {
    StoreCore.initialize();
  }

  function getSchema(uint256 table) public view virtual returns (Schema schema) {
    schema = StoreCore.getSchema(table);
  }

  // Get full record (including full array, load schema from storage)
  function getRecord(uint256 table, bytes32[] calldata key) public view virtual returns (bytes memory data) {
    data = StoreCore.getRecord(table, key);
  }

  // Get full record (including full array)
  function getRecord(
    uint256 table,
    bytes32[] calldata key,
    Schema schema
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getRecord(table, key, schema);
  }

  // Get partial data at schema index
  function getField(
    uint256 table,
    bytes32[] calldata key,
    uint8 schemaIndex
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getField(table, key, schemaIndex);
  }

  function isStore() public view {}
}
