// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { Tables } from "@latticexyz/store/src/codegen/tables/Tables.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";

import { ResourceId, WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";

import { MODULE_NAMESPACE } from "./constants.sol";
import { KeysWithValue } from "./tables/KeysWithValue.sol";
import { ArrayLib } from "../utils/ArrayLib.sol";
import { getTargetTableId } from "./getTargetTableId.sol";

/**
 * This is a very naive and inefficient implementation for now.
 * We can optimize this by adding support for `setIndexOfField` in Store
 * (See https://github.com/latticexyz/mud/issues/444)
 *
 * Note: if a table with composite keys is used, only the first key of the tuple is indexed
 */
contract KeysWithValueHook is StoreHook {
  using ArrayLib for bytes32[];
  using WorldResourceIdInstance for ResourceId;

  function _world() internal view returns (IBaseWorld) {
    return IBaseWorld(StoreSwitch.getStoreAddress());
  }

  function onBeforeSetRecord(
    ResourceId sourceTableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) public override {
    ResourceId targetTableId = getTargetTableId(MODULE_NAMESPACE, sourceTableId);

    // Get the previous value
    bytes32 previousValue = _getRecordValueHash(sourceTableId, keyTuple, fieldLayout);

    // Remove the key from the list of keys with the previous value
    _removeKeyFromList(targetTableId, keyTuple[0], previousValue);

    // Push the key to the list of keys with the new value
    bytes memory data;
    if (dynamicData.length > 0) {
      data = abi.encodePacked(staticData, encodedLengths, dynamicData);
    } else {
      data = staticData;
    }
    KeysWithValue.push(targetTableId, keccak256(data), keyTuple[0]);
  }

  function onBeforeSpliceStaticData(
    ResourceId sourceTableId,
    bytes32[] memory keyTuple,
    uint48,
    bytes memory
  ) public override {
    // Remove the key from the list of keys with the previous value
    FieldLayout fieldLayout = Tables.getFieldLayout(sourceTableId);
    bytes32 previousValue = _getRecordValueHash(sourceTableId, keyTuple, fieldLayout);
    ResourceId targetTableId = getTargetTableId(MODULE_NAMESPACE, sourceTableId);
    _removeKeyFromList(targetTableId, keyTuple[0], previousValue);
  }

  function onAfterSpliceStaticData(
    ResourceId sourceTableId,
    bytes32[] memory keyTuple,
    uint48,
    bytes memory
  ) public override {
    // Add the key to the list of keys with the new value
    FieldLayout fieldLayout = Tables.getFieldLayout(sourceTableId);
    bytes32 newValue = _getRecordValueHash(sourceTableId, keyTuple, fieldLayout);
    ResourceId targetTableId = getTargetTableId(MODULE_NAMESPACE, sourceTableId);
    KeysWithValue.push(targetTableId, newValue, keyTuple[0]);
  }

  function onBeforeSpliceDynamicData(
    ResourceId sourceTableId,
    bytes32[] memory keyTuple,
    uint8,
    uint40,
    uint40,
    PackedCounter,
    bytes memory
  ) public override {
    // Remove the key from the list of keys with the previous value
    FieldLayout fieldLayout = Tables.getFieldLayout(sourceTableId);
    bytes32 previousValue = _getRecordValueHash(sourceTableId, keyTuple, fieldLayout);
    ResourceId targetTableId = getTargetTableId(MODULE_NAMESPACE, sourceTableId);
    _removeKeyFromList(targetTableId, keyTuple[0], previousValue);
  }

  function onAfterSpliceDynamicData(
    ResourceId sourceTableId,
    bytes32[] memory keyTuple,
    uint8,
    uint40,
    uint40,
    PackedCounter,
    bytes memory
  ) public override {
    // Add the key to the list of keys with the new value
    FieldLayout fieldLayout = Tables.getFieldLayout(sourceTableId);
    bytes32 newValue = _getRecordValueHash(sourceTableId, keyTuple, fieldLayout);
    ResourceId targetTableId = getTargetTableId(MODULE_NAMESPACE, sourceTableId);
    KeysWithValue.push(targetTableId, newValue, keyTuple[0]);
  }

  function onBeforeDeleteRecord(
    ResourceId sourceTableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout
  ) public override {
    // Remove the key from the list of keys with the previous value
    bytes32 previousValue = _getRecordValueHash(sourceTableId, keyTuple, fieldLayout);
    ResourceId targetTableId = getTargetTableId(MODULE_NAMESPACE, sourceTableId);
    _removeKeyFromList(targetTableId, keyTuple[0], previousValue);
  }

  function _getRecordValueHash(
    ResourceId sourceTableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout
  ) internal view returns (bytes32 valueHash) {
    (bytes memory staticData, PackedCounter encodedLengths, bytes memory dynamicData) = _world().getRecord(
      sourceTableId,
      keyTuple,
      fieldLayout
    );
    if (dynamicData.length > 0) {
      return keccak256(abi.encodePacked(staticData, encodedLengths, dynamicData));
    } else {
      return keccak256(staticData);
    }
  }

  function _removeKeyFromList(ResourceId targetTableId, bytes32 key, bytes32 valueHash) internal {
    // Get the keys with the previous value excluding the current key
    bytes32[] memory keysWithPreviousValue = KeysWithValue.get(targetTableId, valueHash).filter(key);

    if (keysWithPreviousValue.length == 0) {
      // Delete the list of keys in this table
      KeysWithValue.deleteRecord(targetTableId, valueHash);
    } else {
      // Set the keys with the previous value
      KeysWithValue.set(targetTableId, valueHash, keysWithPreviousValue);
    }
  }
}
