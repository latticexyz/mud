// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { FieldLayout } from "../src/FieldLayout.sol";
import { StoreHook } from "../src/StoreHook.sol";

contract EchoSubscriber is StoreHook {
  event HookCalled(bytes);

  function onBeforeSetRecord(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    bytes memory data,
    FieldLayout fieldLayout
  ) public {
    emit HookCalled(abi.encode(tableId, keyTuple, data, fieldLayout));
  }

  function onAfterSetRecord(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    bytes memory data,
    FieldLayout fieldLayout
  ) public {
    emit HookCalled(abi.encode(tableId, keyTuple, data, fieldLayout));
  }

  function onBeforeSetField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) public {
    emit HookCalled(abi.encode(tableId, keyTuple, schemaIndex, data, fieldLayout));
  }

  function onAfterSetField(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) public {
    emit HookCalled(abi.encode(tableId, keyTuple, schemaIndex, data, fieldLayout));
  }

  function onBeforeDeleteRecord(bytes32 tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) public {
    emit HookCalled(abi.encode(tableId, keyTuple, fieldLayout));
  }

  function onAfterDeleteRecord(bytes32 tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) public {
    emit HookCalled(abi.encode(tableId, keyTuple, fieldLayout));
  }
}
