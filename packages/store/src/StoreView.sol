// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";
import { IStore, IOnUpdateHook } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";

// Not abstract, so that it can be used as a base contract for testing and wherever write access is not needed
contract StoreView is IStore {
  error Store_BaseContractNotImplemented();

  constructor() {
    StoreCore.initialize();
  }

  function getSchema(bytes32 table) public view virtual returns (Schema schema) {
    schema = StoreCore.getSchema(table);
  }

  function registerSchema(bytes32, Schema) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  function setRecord(
    bytes32,
    bytes32[] memory,
    bytes memory
  ) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  function setStaticData(
    bytes32,
    bytes32[] memory,
    bytes memory
  ) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  // Set partial data at schema index
  function setField(
    bytes32,
    bytes32[] memory,
    uint8,
    bytes memory
  ) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  function registerOnUpdateHook(bytes32, IOnUpdateHook) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  // Get full record (including full array, load schema from storage)
  function getRecord(bytes32 table, bytes32[] memory key) public view virtual returns (bytes memory data) {
    data = StoreCore.getRecord(table, key);
  }

  // Get full record (including full array)
  function getRecord(
    bytes32 table,
    bytes32[] memory key,
    Schema schema
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getRecord(table, key, schema);
  }

  // Get partial data at schema index
  function getField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getField(table, key, schemaIndex);
  }

  function isStore() public view {}
}
