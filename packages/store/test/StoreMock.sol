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
  function setRecord(bytes32 table, bytes32[] calldata key, bytes calldata data) public {
    StoreCore.setRecord(table, key, data);
  }

  // Set partial data at schema index
  function setField(bytes32 table, bytes32[] calldata key, uint8 schemaIndex, bytes calldata data) public {
    StoreCore.setField(table, key, schemaIndex, data);
  }

  // Push encoded items to the dynamic field at schema index
  function pushToField(bytes32 table, bytes32[] calldata key, uint8 schemaIndex, bytes calldata dataToPush) public {
    StoreCore.pushToField(table, key, schemaIndex, dataToPush);
  }

  // Pop byte length from the dynamic field at schema index
  function popFromField(bytes32 table, bytes32[] calldata key, uint8 schemaIndex, uint256 byteLengthToPop) public {
    StoreCore.popFromField(table, key, schemaIndex, byteLengthToPop);
  }

  // Change encoded items within the dynamic field at schema index
  function updateInField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet
  ) public {
    StoreCore.updateInField(table, key, schemaIndex, startByteIndex, dataToSet);
  }

  // Set full record (including full dynamic data)
  function deleteRecord(bytes32 table, bytes32[] memory key) public {
    StoreCore.deleteRecord(table, key);
  }

  // Emit the ephemeral event without modifying storage
  function emitEphemeralRecord(bytes32 table, bytes32[] calldata key, bytes calldata data) public {
    StoreCore.emitEphemeralRecord(table, key, data);
  }

  function registerSchema(bytes32 table, Schema schema, Schema keySchema) public {
    StoreCore.registerSchema(table, schema, keySchema);
  }

  function setMetadata(bytes32 table, string calldata tableName, string[] calldata fieldNames) public {
    StoreCore.setMetadata(table, tableName, fieldNames);
  }

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(bytes32 table, IStoreHook hook) public {
    StoreCore.registerStoreHook(table, hook);
  }
}
