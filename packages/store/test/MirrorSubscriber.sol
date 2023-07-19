// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore, IStoreHook } from "../src/IStore.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";
import { Schema } from "../src/Schema.sol";

bytes32 constant indexerTableId = keccak256("indexer.table");

contract MirrorSubscriber is IStoreHook {
  bytes32 _table;

  constructor(
    bytes32 table,
    Schema keySchema,
    Schema valueSchema,
    string[] memory keyNames,
    string[] memory valueNames
  ) {
    IStore(msg.sender).registerTable(indexerTableId, keySchema, valueSchema, keyNames, valueNames);
    _table = table;
  }

  function onSetRecord(bytes32 table, bytes32[] memory key, bytes memory data, Schema valueSchema) public {
    if (table != table) revert("invalid table");
    StoreSwitch.setRecord(indexerTableId, key, data, valueSchema);
  }

  function onBeforeSetField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data,
    Schema valueSchema
  ) public {
    if (table != table) revert("invalid table");
    StoreSwitch.setField(indexerTableId, key, schemaIndex, data, valueSchema);
  }

  function onAfterSetField(bytes32, bytes32[] memory, uint8, bytes memory, Schema) public {}

  function onDeleteRecord(bytes32 table, bytes32[] memory key, Schema valueSchema) public {
    if (table != table) revert("invalid table");
    StoreSwitch.deleteRecord(indexerTableId, key, valueSchema);
  }
}
