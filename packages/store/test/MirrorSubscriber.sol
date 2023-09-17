// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "../src/IStore.sol";
import { StoreHook } from "../src/StoreHook.sol";
import { PackedCounter } from "../src/PackedCounter.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { Schema } from "../src/Schema.sol";

bytes32 constant indexerTableId = keccak256("indexer.tableId");

contract MirrorSubscriber is StoreHook {
  bytes32 _tableId;

  constructor(
    bytes32 tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] memory keyNames,
    string[] memory fieldNames
  ) {
    IStore(msg.sender).registerTable(indexerTableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
    _tableId = tableId;
  }

  function onBeforeSetRecord(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    bytes calldata staticData,
    PackedCounter encodedLengths,
    bytes calldata dynamicData,
    FieldLayout fieldLayout
  ) public {
    if (tableId != _tableId) revert("invalid table");
    StoreSwitch.setRecord(indexerTableId, keyTuple, staticData, encodedLengths, dynamicData, fieldLayout);
  }

  function onAfterSetRecord(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    bytes calldata staticData,
    PackedCounter encodedLengths,
    bytes calldata dynamicData,
    FieldLayout fieldLayout
  ) public {
    // NOOP
  }

  function onBeforeSpliceStaticData(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes memory data
  ) public {
    if (tableId != _tableId) revert("invalid tableId");
    StoreSwitch.spliceStaticData(indexerTableId, keyTuple, start, deleteCount, data);
  }

  function onAfterSpliceStaticData(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes memory data
  ) public {
    // NOOP
  }

  function onBeforeSpliceDynamicData(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes memory data,
    PackedCounter
  ) public {
    if (tableId != _tableId) revert("invalid tableId");
    StoreSwitch.spliceDynamicData(indexerTableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data);
  }

  function onAfterSpliceDynamicData(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes memory data,
    PackedCounter
  ) public {
    if (tableId != _tableId) revert("invalid tableId");
    StoreSwitch.spliceDynamicData(indexerTableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data);
  }

  function onBeforeDeleteRecord(bytes32 tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) public {
    if (tableId != tableId) revert("invalid tableId");
    StoreSwitch.deleteRecord(indexerTableId, keyTuple, fieldLayout);
  }

  function onAfterDeleteRecord(bytes32 tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) public {
    // NOOP
  }
}
