// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IStore } from "./IStore.sol";
import { PackedCounter } from "../src/PackedCounter.sol";
import { IStoreHook } from "./IStoreHook.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { ResourceId } from "./ResourceId.sol";

/**
 * Call IStore functions on self or msg.sender, depending on whether the call is a delegatecall or regular call.
 */
library StoreSwitch {
  bytes32 private constant STORAGE_SLOT = keccak256("mud.store.storage.StoreSwitch");

  struct StorageSlotLayout {
    address storeAddress;
  }

  function _layout() private pure returns (StorageSlotLayout storage layout) {
    bytes32 slot = STORAGE_SLOT;
    assembly {
      layout.slot := slot
    }
  }

  /**
   * Get the Store address for use by other StoreSwitch functions.
   * 0x00 is a magic number for msg.sender
   * (which means that uninitialized storeAddress is msg.sender by default)
   */
  function getStoreAddress() internal view returns (address) {
    address _storeAddress = _layout().storeAddress;
    if (_storeAddress == address(0)) {
      return msg.sender;
    } else {
      return _storeAddress;
    }
  }

  /**
   * Set the Store address for use by other StoreSwitch functions.
   * If it stays uninitialized, StoreSwitch falls back to calling store methods on msg.sender.
   */
  function setStoreAddress(address _storeAddress) internal {
    _layout().storeAddress = _storeAddress;
  }

  function registerStoreHook(ResourceId tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerStoreHook(tableId, hookAddress, enabledHooksBitmap);
    } else {
      IStore(_storeAddress).registerStoreHook(tableId, hookAddress, enabledHooksBitmap);
    }
  }

  function unregisterStoreHook(ResourceId tableId, IStoreHook hookAddress) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.unregisterStoreHook(tableId, hookAddress);
    } else {
      IStore(_storeAddress).unregisterStoreHook(tableId, hookAddress);
    }
  }

  function getFieldLayout(ResourceId tableId) internal view returns (FieldLayout fieldLayout) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      fieldLayout = StoreCore.getFieldLayout(tableId);
    } else {
      fieldLayout = IStore(_storeAddress).getFieldLayout(tableId);
    }
  }

  function getValueSchema(ResourceId tableId) internal view returns (Schema valueSchema) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      valueSchema = StoreCore.getValueSchema(tableId);
    } else {
      valueSchema = IStore(_storeAddress).getValueSchema(tableId);
    }
  }

  function getKeySchema(ResourceId tableId) internal view returns (Schema keySchema) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      keySchema = StoreCore.getKeySchema(tableId);
    } else {
      keySchema = IStore(_storeAddress).getKeySchema(tableId);
    }
  }

  function registerTable(
    ResourceId tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] memory keyNames,
    string[] memory fieldNames
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
    } else {
      IStore(_storeAddress).registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
    }
  }

  function setRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
    } else {
      IStore(_storeAddress).setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
    }
  }

  function spliceStaticData(ResourceId tableId, bytes32[] memory keyTuple, uint48 start, bytes memory data) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.spliceStaticData(tableId, keyTuple, start, data);
    } else {
      IStore(_storeAddress).spliceStaticData(tableId, keyTuple, start, data);
    }
  }

  function spliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes memory data
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data);
    } else {
      IStore(_storeAddress).spliceDynamicData(
        tableId,
        keyTuple,
        dynamicFieldIndex,
        startWithinField,
        deleteCount,
        data
      );
    }
  }

  function setField(ResourceId tableId, bytes32[] memory keyTuple, uint8 fieldIndex, bytes memory data) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setField(tableId, keyTuple, fieldIndex, data);
    } else {
      IStore(_storeAddress).setField(tableId, keyTuple, fieldIndex, data);
    }
  }

  function setField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setField(tableId, keyTuple, fieldIndex, data, fieldLayout);
    } else {
      IStore(_storeAddress).setField(tableId, keyTuple, fieldIndex, data, fieldLayout);
    }
  }

  function setStaticField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setStaticField(tableId, keyTuple, fieldIndex, data, fieldLayout);
    } else {
      IStore(_storeAddress).setStaticField(tableId, keyTuple, fieldIndex, data, fieldLayout);
    }
  }

  function setDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    bytes memory data
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setDynamicField(tableId, keyTuple, dynamicFieldIndex, data);
    } else {
      IStore(_storeAddress).setDynamicField(tableId, keyTuple, dynamicFieldIndex, data);
    }
  }

  function pushToDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    bytes memory dataToPush
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.pushToDynamicField(tableId, keyTuple, dynamicFieldIndex, dataToPush);
    } else {
      IStore(_storeAddress).pushToDynamicField(tableId, keyTuple, dynamicFieldIndex, dataToPush);
    }
  }

  function popFromDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint256 byteLengthToPop
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.popFromDynamicField(tableId, keyTuple, dynamicFieldIndex, byteLengthToPop);
    } else {
      IStore(_storeAddress).popFromDynamicField(tableId, keyTuple, dynamicFieldIndex, byteLengthToPop);
    }
  }

  function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.deleteRecord(tableId, keyTuple);
    } else {
      IStore(_storeAddress).deleteRecord(tableId, keyTuple);
    }
  }

  function getRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple
  ) internal view returns (bytes memory, PackedCounter, bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getRecord(tableId, keyTuple);
    } else {
      return IStore(_storeAddress).getRecord(tableId, keyTuple);
    }
  }

  function getRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory, PackedCounter, bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getRecord(tableId, keyTuple, fieldLayout);
    } else {
      return IStore(_storeAddress).getRecord(tableId, keyTuple, fieldLayout);
    }
  }

  function getField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getField(tableId, keyTuple, fieldIndex);
    } else {
      return IStore(_storeAddress).getField(tableId, keyTuple, fieldIndex);
    }
  }

  function getField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getField(tableId, keyTuple, fieldIndex, fieldLayout);
    } else {
      return IStore(_storeAddress).getField(tableId, keyTuple, fieldIndex, fieldLayout);
    }
  }

  function getStaticField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (bytes32) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getStaticField(tableId, keyTuple, fieldIndex, fieldLayout);
    } else {
      return IStore(_storeAddress).getStaticField(tableId, keyTuple, fieldIndex, fieldLayout);
    }
  }

  function getDynamicField(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getDynamicField(tableId, keyTuple, dynamicFieldIndex);
    } else {
      return IStore(_storeAddress).getDynamicField(tableId, keyTuple, dynamicFieldIndex);
    }
  }

  function getFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex
  ) internal view returns (uint256) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getFieldLength(tableId, keyTuple, fieldIndex);
    } else {
      return IStore(_storeAddress).getFieldLength(tableId, keyTuple, fieldIndex);
    }
  }

  function getFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (uint256) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getFieldLength(tableId, keyTuple, fieldIndex, fieldLayout);
    } else {
      return IStore(_storeAddress).getFieldLength(tableId, keyTuple, fieldIndex, fieldLayout);
    }
  }

  function getDynamicFieldLength(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex
  ) internal view returns (uint256) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getDynamicFieldLength(tableId, keyTuple, dynamicFieldIndex);
    } else {
      return IStore(_storeAddress).getDynamicFieldLength(tableId, keyTuple, dynamicFieldIndex);
    }
  }

  function getDynamicFieldSlice(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint256 start,
    uint256 end
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getDynamicFieldSlice(tableId, keyTuple, dynamicFieldIndex, start, end);
    } else {
      return IStore(_storeAddress).getDynamicFieldSlice(tableId, keyTuple, dynamicFieldIndex, start, end);
    }
  }
}
