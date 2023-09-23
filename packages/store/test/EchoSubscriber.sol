// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PackedCounter } from "../src/PackedCounter.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { StoreHook } from "../src/StoreHook.sol";
import { ResourceId } from "../src/ResourceId.sol";

contract EchoSubscriber is StoreHook {
  event HookCalled(bytes);

  function onBeforeSetRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) public override {
    emit HookCalled(
      abi.encodeCall(this.onBeforeSetRecord, (tableId, keyTuple, staticData, encodedLengths, dynamicData, fieldLayout))
    );
  }

  function onAfterSetRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) public override {
    emit HookCalled(
      abi.encodeCall(this.onAfterSetRecord, (tableId, keyTuple, staticData, encodedLengths, dynamicData, fieldLayout))
    );
  }

  function onBeforeSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) public override {
    emit HookCalled(abi.encodeCall(this.onBeforeSpliceStaticData, (tableId, keyTuple, start, data)));
  }

  function onAfterSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) public override {
    emit HookCalled(abi.encodeCall(this.onAfterSpliceStaticData, (tableId, keyTuple, start, data)));
  }

  function onBeforeSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes memory data,
    PackedCounter encodedLengths
  ) public override {
    emit HookCalled(
      abi.encodeCall(
        this.onBeforeSpliceDynamicData,
        (tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data, encodedLengths)
      )
    );
  }

  function onAfterSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes memory data,
    PackedCounter encodedLengths
  ) public override {
    emit HookCalled(
      abi.encodeCall(
        this.onAfterSpliceDynamicData,
        (tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data, encodedLengths)
      )
    );
  }

  function onBeforeDeleteRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout
  ) public override {
    emit HookCalled(abi.encodeCall(this.onBeforeDeleteRecord, (tableId, keyTuple, fieldLayout)));
  }

  function onAfterDeleteRecord(ResourceId tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) public override {
    emit HookCalled(abi.encodeCall(this.onAfterDeleteRecord, (tableId, keyTuple, fieldLayout)));
  }
}
