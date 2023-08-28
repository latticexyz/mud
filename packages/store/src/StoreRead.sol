// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreRead } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { FieldLayout } from "./FieldLayout.sol";

contract StoreRead is IStoreRead {
  constructor() {
    StoreCore.initialize();
  }

  function getValueFieldLayout(bytes32 table) public view virtual returns (FieldLayout fieldLayout) {
    fieldLayout = StoreCore.getValueFieldLayout(table);
  }

  function getKeyFieldLayout(bytes32 table) public view virtual returns (FieldLayout fieldLayout) {
    fieldLayout = StoreCore.getKeyFieldLayout(table);
  }

  // Get full record (static and dynamic data)
  function getRecord(
    bytes32 table,
    bytes32[] calldata key,
    FieldLayout valueFieldLayout
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getRecord(table, key, valueFieldLayout);
  }

  // Get partial data at schema index
  function getField(
    bytes32 table,
    bytes32[] calldata key,
    uint8 schemaIndex,
    FieldLayout valueFieldLayout
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getField(table, key, schemaIndex, valueFieldLayout);
  }

  function getFieldLength(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (uint256) {
    return StoreCore.getFieldLength(tableId, key, schemaIndex, fieldLayout);
  }

  function getFieldSlice(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    FieldLayout fieldLayout,
    uint256 start,
    uint256 end
  ) public view virtual returns (bytes memory) {
    return StoreCore.getFieldSlice(tableId, key, schemaIndex, fieldLayout, start, end);
  }
}
