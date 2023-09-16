// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStoreRead } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { Schema } from "./Schema.sol";

contract StoreRead is IStoreRead {
  function getFieldLayout(bytes32 tableId) public view virtual returns (FieldLayout fieldLayout) {
    fieldLayout = StoreCore.getFieldLayout(tableId);
  }

  function getValueSchema(bytes32 tableId) public view virtual returns (Schema valueSchema) {
    valueSchema = StoreCore.getValueSchema(tableId);
  }

  function getKeySchema(bytes32 tableId) public view virtual returns (Schema keySchema) {
    keySchema = StoreCore.getKeySchema(tableId);
  }

  function getRecord(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getRecord(tableId, keyTuple, fieldLayout);
  }

  function getField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getField(tableId, keyTuple, fieldIndex, fieldLayout);
  }

  function getStaticField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes32 data) {
    data = StoreCore.getStaticField(tableId, keyTuple, fieldIndex, fieldLayout);
  }

  function getDynamicField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getDynamicField(tableId, keyTuple, dynamicFieldIndex);
  }

  function getFieldLength(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (uint256) {
    return StoreCore.getFieldLength(tableId, keyTuple, fieldIndex, fieldLayout);
  }

  function getFieldSlice(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout,
    uint256 start,
    uint256 end
  ) public view virtual returns (bytes memory) {
    return StoreCore.getFieldSlice(tableId, keyTuple, fieldIndex, fieldLayout, start, end);
  }
}
