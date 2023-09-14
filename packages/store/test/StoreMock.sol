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
  function setRecord(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.setRecord(tableId, keyTuple, data, fieldLayout);
  }

  // Set partial data at schema index
  function setField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 schemaIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.setField(tableId, keyTuple, schemaIndex, data, fieldLayout);
  }

  // Push encoded items to the dynamic field at schema index
  function pushToField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 schemaIndex,
    bytes calldata dataToPush,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.pushToField(tableId, keyTuple, schemaIndex, dataToPush, fieldLayout);
  }

  // Pop byte length from the dynamic field at schema index
  function popFromField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 schemaIndex,
    uint256 byteLengthToPop,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.popFromField(tableId, keyTuple, schemaIndex, byteLengthToPop, fieldLayout);
  }

  // Change encoded items within the dynamic field at schema index
  function updateInField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 schemaIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.updateInField(tableId, keyTuple, schemaIndex, startByteIndex, dataToSet, fieldLayout);
  }

  // Set full record (including full dynamic data)
  function deleteRecord(bytes32 tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) public virtual {
    StoreCore.deleteRecord(tableId, keyTuple, fieldLayout);
  }

  // Emit the ephemeral event without modifying storage
  function emitEphemeralRecord(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.emitEphemeralRecord(tableId, keyTuple, data, fieldLayout);
  }

  function registerTable(
    bytes32 tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) public virtual {
    StoreCore.registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
  }

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(bytes32 tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) public virtual {
    StoreCore.registerStoreHook(tableId, hookAddress, enabledHooksBitmap);
  }

  // Unregister hook to be called when a record or field is set or deleted
  function unregisterStoreHook(bytes32 tableId, IStoreHook hookAddress) public virtual {
    StoreCore.unregisterStoreHook(tableId, hookAddress);
  }
}
