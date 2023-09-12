// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreHook } from "../src/StoreHook.sol";
import { Schema } from "../src/Schema.sol";

contract EchoSubscriber is StoreHook {
  event HookCalled(bytes);

  function onBeforeSetRecord(bytes32 table, bytes32[] memory key, bytes memory data, Schema valueSchema) public {
    emit HookCalled(abi.encode(table, key, data, valueSchema));
  }

  function onAfterSetRecord(bytes32 table, bytes32[] memory key, bytes memory data, Schema valueSchema) public {
    emit HookCalled(abi.encode(table, key, data, valueSchema));
  }

  function onBeforeSetField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data,
    Schema valueSchema
  ) public {
    emit HookCalled(abi.encode(table, key, schemaIndex, data, valueSchema));
  }

  function onAfterSetField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data,
    Schema valueSchem
  ) public {
    emit HookCalled(abi.encode(table, key, schemaIndex, data, valueSchem));
  }

  function onBeforeDeleteRecord(bytes32 table, bytes32[] memory key, Schema valueSchema) public {
    emit HookCalled(abi.encode(table, key, valueSchema));
  }

  function onAfterDeleteRecord(bytes32 table, bytes32[] memory key, Schema valueSchema) public {
    emit HookCalled(abi.encode(table, key, valueSchema));
  }
}
