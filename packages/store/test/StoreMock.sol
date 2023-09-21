// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IStore, IStoreHook } from "../src/IStore.sol";
import { PackedCounter } from "../src/PackedCounter.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { Schema } from "../src/Schema.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { StoreRead } from "../src/StoreRead.sol";
import { ResourceId } from "../src/ResourceId.sol";

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
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    bytes calldata staticData,
    PackedCounter encodedLengths,
    bytes calldata dynamicData,
    FieldLayout fieldLayout
  ) public {
    StoreCore.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData, fieldLayout);
  }

  // Splice data in the static part of the record
  function spliceStaticData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes calldata data
  ) public virtual {
    StoreCore.spliceStaticData(tableId, keyTuple, start, deleteCount, data);
  }

  // Splice data in the dynamic part of the record
  function spliceDynamicData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes calldata data
  ) public virtual {
    StoreCore.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data);
  }

  // Set partial data at field index
  function setField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.setField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  // Push encoded items to the dynamic field at field index
  function pushToField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata dataToPush,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.pushToField(tableId, keyTuple, fieldIndex, dataToPush, fieldLayout);
  }

  // Pop byte length from the dynamic field at field index
  function popFromField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    uint256 byteLengthToPop,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.popFromField(tableId, keyTuple, fieldIndex, byteLengthToPop, fieldLayout);
  }

  // Change encoded items within the dynamic field at field index
  function updateInField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    uint256 startByteIndex,
    bytes calldata dataToSet,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.updateInField(tableId, keyTuple, fieldIndex, startByteIndex, dataToSet, fieldLayout);
  }

  // Set full record (including full dynamic data)
  function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) public virtual {
    StoreCore.deleteRecord(tableId, keyTuple, fieldLayout);
  }

  function registerTable(
    ResourceId tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) public virtual {
    StoreCore.registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
  }

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(ResourceId tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) public virtual {
    StoreCore.registerStoreHook(tableId, hookAddress, enabledHooksBitmap);
  }

  // Unregister hook to be called when a record or field is set or deleted
  function unregisterStoreHook(ResourceId tableId, IStoreHook hookAddress) public virtual {
    StoreCore.unregisterStoreHook(tableId, hookAddress);
  }
}
