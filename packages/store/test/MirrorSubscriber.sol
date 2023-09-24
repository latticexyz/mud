// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IStore } from "../src/IStore.sol";
import { StoreHook } from "../src/StoreHook.sol";
import { PackedCounter } from "../src/PackedCounter.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { Schema } from "../src/Schema.sol";
import { ResourceId } from "../src/ResourceId.sol";
import { RESOURCE_TABLE } from "../src/storeResourceTypes.sol";

ResourceId constant indexerTableId = ResourceId.wrap(
  bytes32(abi.encodePacked(RESOURCE_TABLE, bytes14("mirror"), bytes16("indexer")))
);

contract MirrorSubscriber is StoreHook {
  bytes32 public _tableId;

  constructor(
    ResourceId tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] memory keyNames,
    string[] memory fieldNames
  ) {
    IStore(msg.sender).registerTable(indexerTableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
    _tableId = ResourceId.unwrap(tableId);
  }

  function onBeforeSetRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout
  ) public override {
    if (ResourceId.unwrap(tableId) != _tableId) revert("invalid table");
    StoreSwitch.setRecord(indexerTableId, keyTuple, staticData, encodedLengths, dynamicData);
  }

  function onBeforeSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) public override {
    if (ResourceId.unwrap(tableId) != _tableId) revert("invalid tableId");
    StoreSwitch.spliceStaticData(indexerTableId, keyTuple, start, data);
  }

  function onBeforeSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes memory data,
    PackedCounter
  ) public override {
    if (ResourceId.unwrap(tableId) != _tableId) revert("invalid tableId");
    StoreSwitch.spliceDynamicData(indexerTableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data);
  }

  function onBeforeDeleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout) public override {
    if (ResourceId.unwrap(tableId) != _tableId) revert("invalid tableId");
    StoreSwitch.deleteRecord(indexerTableId, keyTuple);
  }
}
