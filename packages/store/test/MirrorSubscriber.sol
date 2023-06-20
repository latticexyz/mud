// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "../src/IStore.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";
import { StoreHook } from "../src/StoreHook.sol";
import { Schema } from "../src/Schema.sol";

bytes32 constant indexerTableId = keccak256("indexer.table");

contract MirrorSubscriber is StoreHook {
  bytes32 _table;

  constructor(bytes32 table, Schema schema, Schema keySchema) {
    IStore(msg.sender).registerSchema(indexerTableId, schema, keySchema);
    _table = table;
  }

  function onSetRecord(bytes32 table, bytes32[] memory key, bytes memory data) public {
    if (table != table) revert("invalid table");
    StoreSwitch.setRecord(indexerTableId, key, data);
  }

  function onBeforeSetField(bytes32 table, bytes32[] memory key, uint8 schemaIndex, bytes memory data) public {
    if (table != table) revert("invalid table");
    StoreSwitch.setField(indexerTableId, key, schemaIndex, data);
  }

  function onAfterSetField(bytes32, bytes32[] memory, uint8, bytes memory) public {}

  function onDeleteRecord(bytes32 table, bytes32[] memory key) public {
    if (table != table) revert("invalid table");
    StoreSwitch.deleteRecord(indexerTableId, key);
  }
}
