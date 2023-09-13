// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore, IStoreHook } from "../src/IStore.sol";
import { Schema } from "../src/Schema.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { StoreRead } from "../src/StoreRead.sol";

/**
 * StoreMock is a contract wrapper around the StoreCore library for testing purposes.
 */
contract StoreMock is IStore, StoreRead {
  constructor() {
    StoreCore.initialize();
    StoreCore.registerCoreTables();
  }

  // Set full record (including full dynamic data)
  function setRecord(bytes32 table, bytes32[] calldata key, bytes calldata data, FieldLayout fieldLayout) public {
    StoreCore.setRecord(table, key, data, fieldLayout);
  }

  // Set partial data at schema index
  function setField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public {
    StoreCore.setField(table, key, schemaIndex, data, fieldLayout);
  }

  // Push encoded items to the dynamic field at schema index
  function pushToField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    bytes calldata dataToPush,
    FieldLayout fieldLayout
  ) public {
    StoreCore.pushToField(table, key, schemaIndex, dataToPush, fieldLayout);
  }

  // Pop byte length from the dynamic field at schema index
  function popFromField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 byteLengthToPop,
    FieldLayout fieldLayout
  ) public {
    StoreCore.popFromField(table, key, schemaIndex, byteLengthToPop, fieldLayout);
  }

  // Change encoded items within the dynamic field at schema index
  function updateInField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet,
    FieldLayout fieldLayout
  ) public {
    StoreCore.updateInField(table, key, schemaIndex, startByteIndex, dataToSet, fieldLayout);
  }

  // Set full record (including full dynamic data)
  function deleteRecord(bytes32 table, bytes32[] memory key, FieldLayout fieldLayout) public {
    StoreCore.deleteRecord(table, key, fieldLayout);
  }

  // Emit the ephemeral event without modifying storage
  function emitEphemeralRecord(
    bytes32 table,
    bytes32[] calldata key,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public {
    StoreCore.emitEphemeralRecord(table, key, data, fieldLayout);
  }

  function registerTable(
    bytes32 table,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) public {
    StoreCore.registerTable(table, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
  }

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(bytes32 table, IStoreHook hookAddress, uint8 enabledHooksBitmap) public {
    StoreCore.registerStoreHook(table, hookAddress, enabledHooksBitmap);
  }

  // Unregister hook to be called when a record or field is set or deleted
  function unregisterStoreHook(bytes32 table, IStoreHook hookAddress) public {
    StoreCore.unregisterStoreHook(table, hookAddress);
  }
}
