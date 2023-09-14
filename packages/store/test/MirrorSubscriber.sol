// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "../src/IStore.sol";
import { StoreHook } from "../src/StoreHook.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { Schema } from "../src/Schema.sol";

bytes32 constant indexerTableId = keccak256("indexer.table");

contract MirrorSubscriber is StoreHook {
  bytes32 _table;

  constructor(
    bytes32 table,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    bool offchainOnly,
    string[] memory keyNames,
    string[] memory fieldNames
  ) {
    IStore(msg.sender).registerTable(
      indexerTableId,
      fieldLayout,
      keySchema,
      valueSchema,
      offchainOnly,
      keyNames,
      fieldNames
    );
    _table = table;
  }

  function onBeforeSetRecord(bytes32 table, bytes32[] memory key, bytes memory data, FieldLayout fieldLayout) public {
    if (table != table) revert("invalid table");
    StoreSwitch.setRecord(indexerTableId, key, data, fieldLayout);
  }

  function onAfterSetRecord(bytes32 table, bytes32[] memory key, bytes memory data, FieldLayout fieldLayout) public {
    // NOOP
  }

  function onBeforeSetField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) public {
    if (table != table) revert("invalid table");
    StoreSwitch.setField(indexerTableId, key, schemaIndex, data, fieldLayout);
  }

  function onAfterSetField(bytes32, bytes32[] memory, uint8, bytes memory, FieldLayout) public {
    // NOOP
  }

  function onBeforeDeleteRecord(bytes32 table, bytes32[] memory key, FieldLayout fieldLayout) public {
    if (table != table) revert("invalid table");
    StoreSwitch.deleteRecord(indexerTableId, key, fieldLayout);
  }

  function onAfterDeleteRecord(bytes32 table, bytes32[] memory key, FieldLayout fieldLayout) public {
    // NOOP
  }
}
