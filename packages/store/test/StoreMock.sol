// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore, IStoreHook } from "../src/IStore.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { StoreRead } from "../src/StoreRead.sol";

/**
 * StoreMock is a contract wrapper around the StoreCore library for testing purposes.
 */
contract StoreMock is IStore, StoreRead {
  // Set full record (including full dynamic data)
  function setRecord(bytes32 table, bytes32[] calldata key, bytes calldata data, FieldLayout valueFieldLayout) public {
    StoreCore.setRecord(table, key, data, valueFieldLayout);
  }

  // Set partial data at schema index
  function setField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data,
    FieldLayout valueFieldLayout
  ) public {
    StoreCore.setField(table, key, schemaIndex, data, valueFieldLayout);
  }

  // Push encoded items to the dynamic field at schema index
  function pushToField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush,
    FieldLayout valueFieldLayout
  ) public {
    StoreCore.pushToField(table, key, schemaIndex, dataToPush, valueFieldLayout);
  }

  // Pop byte length from the dynamic field at schema index
  function popFromField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 byteLengthToPop,
    FieldLayout valueFieldLayout
  ) public {
    StoreCore.popFromField(table, key, schemaIndex, byteLengthToPop, valueFieldLayout);
  }

  // Change encoded items within the dynamic field at schema index
  function updateInField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet,
    FieldLayout valueFieldLayout
  ) public {
    StoreCore.updateInField(table, key, schemaIndex, startByteIndex, dataToSet, valueFieldLayout);
  }

  // Set full record (including full dynamic data)
  function deleteRecord(bytes32 table, bytes32[] memory key, FieldLayout valueFieldLayout) public {
    StoreCore.deleteRecord(table, key, valueFieldLayout);
  }

  // Emit the ephemeral event without modifying storage
  function emitEphemeralRecord(
    bytes32 table,
    bytes32[] calldata key,
    bytes calldata data,
    FieldLayout valueFieldLayout
  ) public {
    StoreCore.emitEphemeralRecord(table, key, data, valueFieldLayout);
  }

  function registerTable(
    bytes32 table,
    FieldLayout keyFieldLayout,
    FieldLayout valueFieldLayout,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) public {
    StoreCore.registerTable(table, keyFieldLayout, valueFieldLayout, keyNames, fieldNames);
  }

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(bytes32 table, IStoreHook hook) public {
    StoreCore.registerStoreHook(table, hook);
  }
}
