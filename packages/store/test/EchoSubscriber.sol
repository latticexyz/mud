// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreHook } from "../src/IStore.sol";
import { Schema } from "../src/Schema.sol";
import { PackedCounter } from "../src/PackedCounter.sol";

contract EchoSubscriber is IStoreHook {
  event HookCalled(bytes);

  function onBeforeSetRecord(
    bytes32 table,
    bytes32[] memory key,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    Schema valueSchema
  ) public {
    emit HookCalled(abi.encode(table, key, staticData, encodedLengths, dynamicData, valueSchema));
  }

  function onAfterSetRecord(
    bytes32 table,
    bytes32[] memory key,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    Schema valueSchema
  ) public {
    emit HookCalled(abi.encode(table, key, staticData, encodedLengths, dynamicData, valueSchema));
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
