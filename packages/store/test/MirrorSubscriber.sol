// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "../src/IStore.sol";
import { StoreHook } from "../src/StoreHook.sol";
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

  function onBeforeSetRecord(bytes32 tableId, bytes32[] memory key, bytes memory data, FieldLayout fieldLayout) public {
    if (tableId != tableId) revert("invalid tableId");
    StoreSwitch.setRecord(indexerTableId, key, data, fieldLayout);
  }

  function onAfterSetRecord(bytes32 tableId, bytes32[] memory key, bytes memory data, FieldLayout fieldLayout) public {
    // NOOP
  }

  function onBeforeSetField(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) public {
    if (tableId != tableId) revert("invalid tableId");
    StoreSwitch.setField(indexerTableId, key, schemaIndex, data, fieldLayout);
  }

  function onAfterSetField(bytes32, bytes32[] memory, uint8, bytes memory, FieldLayout) public {
    // NOOP
  }

  function onBeforeDeleteRecord(bytes32 tableId, bytes32[] memory key, FieldLayout fieldLayout) public {
    if (tableId != tableId) revert("invalid tableId");
    StoreSwitch.deleteRecord(indexerTableId, key, fieldLayout);
  }

  function onAfterDeleteRecord(bytes32 tableId, bytes32[] memory key, FieldLayout fieldLayout) public {
    // NOOP
  }
}
