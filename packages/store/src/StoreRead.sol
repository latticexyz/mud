// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { STORE_VERSION } from "./version.sol";
import { IStoreRead } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { Schema } from "./Schema.sol";

contract StoreRead is IStoreRead {
  function storeVersion() public pure returns (bytes32) {
    return STORE_VERSION;
  }

  function getFieldLayout(bytes32 tableId) public view virtual returns (FieldLayout fieldLayout) {
    fieldLayout = StoreCore.getFieldLayout(tableId);
  }

  function getValueSchema(bytes32 tableId) public view virtual returns (Schema valueSchema) {
    valueSchema = StoreCore.getValueSchema(tableId);
  }

  function getKeySchema(bytes32 tableId) public view virtual returns (Schema keySchema) {
    keySchema = StoreCore.getKeySchema(tableId);
  }

  // Get full record (static and dynamic data)
  function getRecord(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getRecord(tableId, keyTuple, fieldLayout);
  }

  // Get partial data at schema index
  function getField(
    bytes32 tableId,
    bytes32[] calldata keyTuple,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (bytes memory data) {
    data = StoreCore.getField(tableId, keyTuple, schemaIndex, fieldLayout);
  }

  function getFieldLength(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    FieldLayout fieldLayout
  ) public view virtual returns (uint256) {
    return StoreCore.getFieldLength(tableId, keyTuple, schemaIndex, fieldLayout);
  }

  function getFieldSlice(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 schemaIndex,
    FieldLayout fieldLayout,
    uint256 start,
    uint256 end
  ) public view virtual returns (bytes memory) {
    return StoreCore.getFieldSlice(tableId, keyTuple, schemaIndex, fieldLayout, start, end);
  }
}
