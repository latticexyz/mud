// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore, IStoreHook } from "../src/IStore.sol";
import { PackedCounter } from "../src/PackedCounter.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { Schema } from "../src/Schema.sol";
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
    bytes calldata staticData,
    PackedCounter encodedLengths,
    bytes calldata dynamicData,
    FieldLayout fieldLayout
  ) public {
    StoreCore.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData, fieldLayout);
  }

  // Set partial data at schema index
  function setField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.setField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  // Push encoded items to the dynamic field at schema index
  function pushToField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata dataToPush,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.pushToField(tableId, keyTuple, fieldIndex, dataToPush, fieldLayout);
  }

  // Pop byte length from the dynamic field at schema index
  function popFromField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    uint256 byteLengthToPop,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.popFromField(tableId, keyTuple, fieldIndex, byteLengthToPop, fieldLayout);
  }

  // Change encoded items within the dynamic field at schema index
  function updateInField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.updateInField(tableId, keyTuple, fieldIndex, startByteIndex, dataToSet, fieldLayout);
  }

  // Set full record (including full dynamic data)
  function deleteRecord(bytes32 tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) public virtual {
    StoreCore.deleteRecord(tableId, keyTuple, fieldLayout);
  }

  // Emit the ephemeral event without modifying storage
  function emitEphemeralRecord(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    bytes calldata staticData,
    PackedCounter encodedLengths,
    bytes calldata dynamicData,
    FieldLayout fieldLayout
  ) public {
    StoreCore.emitEphemeralRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData, fieldLayout);
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
