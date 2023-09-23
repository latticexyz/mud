// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { STORE_VERSION } from "./version.sol";
import { IStoreRead } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { Schema } from "./Schema.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { ResourceId } from "./ResourceId.sol";

contract StoreRead is IStoreRead {
  function storeVersion() public pure returns (bytes32) {
    return STORE_VERSION;
  }

  function getFieldLayout(ResourceId tableId) public view virtual returns (FieldLayout fieldLayout) {
    fieldLayout = StoreCore.getFieldLayout(tableId);
  }

  function getValueSchema(ResourceId tableId) public view virtual returns (Schema valueSchema) {
    valueSchema = StoreCore.getValueSchema(tableId);
  }

  function getKeySchema(ResourceId tableId) public view virtual returns (Schema keySchema) {
    keySchema = StoreCore.getKeySchema(tableId);
  }

  function getRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) {
    return StoreCore.getRecord(tableId, keyTuple, fieldLayout);
  }

  function getField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getField(tableId, keyTuple, fieldIndex, fieldLayout);
  }

  function getStaticField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes32 data) {
    data = StoreCore.getStaticField(tableId, keyTuple, fieldIndex, fieldLayout);
  }

  function getDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getDynamicField(tableId, keyTuple, dynamicFieldIndex);
  }

  function getFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (uint256) {
    return StoreCore.getFieldLength(tableId, keyTuple, fieldIndex, fieldLayout);
  }

  function getDynamicFieldSlice(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint256 start,
    uint256 end
  ) public view virtual returns (bytes memory) {
    return StoreCore.getDynamicFieldSlice(tableId, keyTuple, dynamicFieldIndex, start, end);
  }
}
