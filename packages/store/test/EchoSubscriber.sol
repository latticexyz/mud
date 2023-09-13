// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { FieldLayout } from "../src/FieldLayout.sol";
import { StoreHook } from "../src/StoreHook.sol";

contract EchoSubscriber is StoreHook {
  event HookCalled(bytes);

  function onBeforeSetRecord(bytes32 table, bytes32[] memory key, bytes memory data, FieldLayout fieldLayout) public {
    emit HookCalled(abi.encode(table, key, data, fieldLayout));
  }

  function onAfterSetRecord(bytes32 table, bytes32[] memory key, bytes memory data, FieldLayout fieldLayout) public {
    emit HookCalled(abi.encode(table, key, data, fieldLayout));
  }

  function onBeforeSetField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) public {
    emit HookCalled(abi.encode(table, key, schemaIndex, data, fieldLayout));
  }

  function onAfterSetField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) public {
    emit HookCalled(abi.encode(table, key, schemaIndex, data, fieldLayout));
  }

  function onBeforeDeleteRecord(bytes32 table, bytes32[] memory key, FieldLayout fieldLayout) public {
    emit HookCalled(abi.encode(table, key, fieldLayout));
  }

  function onAfterDeleteRecord(bytes32 table, bytes32[] memory key, FieldLayout fieldLayout) public {
    emit HookCalled(abi.encode(table, key, fieldLayout));
  }
}
