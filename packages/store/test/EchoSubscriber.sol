// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PackedCounter } from "../src/PackedCounter.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { StoreHook } from "../src/StoreHook.sol";

contract EchoSubscriber is StoreHook {
  event HookCalled(bytes);

  function onBeforeSetRecord(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) public {
    emit HookCalled(abi.encode(tableId, keyTuple, staticData, encodedLengths, dynamicData, fieldLayout));
  }

  function onAfterSetRecord(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) public {
    emit HookCalled(abi.encode(tableId, keyTuple, staticData, encodedLengths, dynamicData, fieldLayout));
  }

  function onBeforeSpliceStaticData(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes calldata data
  ) public {
    emit HookCalled(abi.encode(tableId, keyTuple, start, deleteCount, data));
  }

  function onAfterSpliceStaticData(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes calldata data
  ) public {
    emit HookCalled(abi.encode(tableId, keyTuple, start, deleteCount, data));
  }

  function onBeforeSpliceDynamicData(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes calldata data,
    PackedCounter encodedLengths
  ) public {
    emit HookCalled(
      abi.encode(tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data, encodedLengths.unwrap())
    );
  }

  function onAfterSpliceDynamicData(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes calldata data,
    PackedCounter encodedLengths
  ) public {
    emit HookCalled(
      abi.encode(tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data, encodedLengths.unwrap())
    );
  }

  function onBeforeDeleteRecord(bytes32 tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) public {
    emit HookCalled(abi.encode(tableId, keyTuple, fieldLayout));
  }

  function onAfterDeleteRecord(bytes32 tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) public {
    emit HookCalled(abi.encode(tableId, keyTuple, fieldLayout));
  }
}
