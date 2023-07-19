// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore, IStoreHook } from "../src/IStore.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { Schema } from "../src/Schema.sol";
import { StoreRead } from "../src/StoreRead.sol";

/**
 * StoreMock is a contract wrapper around the StoreCore library for testing purposes.
 */
contract StoreMock is IStore, StoreRead {
  // Set full record (including full dynamic data)
  function setRecord(bytes32 table, bytes32[] calldata key, bytes calldata data, Schema valueSchema) public {
    StoreCore.setRecord(table, key, data, valueSchema);
  }

  // Set partial data at schema index
  function setField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data,
    Schema valueSchema
  ) public {
    StoreCore.setField(table, key, schemaIndex, data, valueSchema);
  }

  // Push encoded items to the dynamic field at schema index
  function pushToField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush,
    Schema valueSchema
  ) public {
    StoreCore.pushToField(table, key, schemaIndex, dataToPush, valueSchema);
  }

  // Pop byte length from the dynamic field at schema index
  function popFromField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 byteLengthToPop,
    Schema valueSchema
  ) public {
    StoreCore.popFromField(table, key, schemaIndex, byteLengthToPop, valueSchema);
  }

  // Change encoded items within the dynamic field at schema index
  function updateInField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet,
    Schema valueSchema
  ) public {
    StoreCore.updateInField(table, key, schemaIndex, startByteIndex, dataToSet, valueSchema);
  }

  // Set full record (including full dynamic data)
  function deleteRecord(bytes32 table, bytes32[] memory key, Schema valueSchema) public {
    StoreCore.deleteRecord(table, key, valueSchema);
  }

  // Emit the ephemeral event without modifying storage
  function emitEphemeralRecord(bytes32 table, bytes32[] calldata key, bytes calldata data, Schema valueSchema) public {
    StoreCore.emitEphemeralRecord(table, key, data, valueSchema);
  }

  function registerTable(
    bytes32 table,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata valueNames
  ) public {
    StoreCore.registerTable(table, keySchema, valueSchema, keyNames, valueNames);
  }

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(bytes32 table, IStoreHook hook) public {
    StoreCore.registerStoreHook(table, hook);
  }
}
