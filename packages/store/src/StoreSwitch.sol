// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "./IStore.sol";
import { IStoreHook } from "./IStoreHook.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";
import { FieldLayout } from "./FieldLayout.sol";

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

  function registerStoreHook(bytes32 tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerStoreHook(tableId, hookAddress, enabledHooksBitmap);
    } else {
      IStore(_storeAddress).registerStoreHook(tableId, hookAddress, enabledHooksBitmap);
    }
  }

  function unregisterStoreHook(bytes32 tableId, IStoreHook hookAddress) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.unregisterStoreHook(tableId, hookAddress);
    } else {
      IStore(_storeAddress).unregisterStoreHook(tableId, hookAddress);
    }
  }

  function getFieldLayout(bytes32 tableId) internal view returns (FieldLayout fieldLayout) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      fieldLayout = StoreCore.getFieldLayout(tableId);
    } else {
      fieldLayout = IStore(_storeAddress).getFieldLayout(tableId);
    }
  }

  function getValueSchema(bytes32 tableId) internal view returns (Schema valueSchema) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      valueSchema = StoreCore.getValueSchema(tableId);
    } else {
      valueSchema = IStore(_storeAddress).getValueSchema(tableId);
    }
  }

  function getKeySchema(bytes32 tableId) internal view returns (Schema keySchema) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      keySchema = StoreCore.getKeySchema(tableId);
    } else {
      keySchema = IStore(_storeAddress).getKeySchema(tableId);
    }
  }

  function registerTable(
    bytes32 tableId,
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

  function setRecord(bytes32 tableId, bytes32[] memory key, bytes memory data, FieldLayout fieldLayout) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setRecord(tableId, key, data, fieldLayout);
    } else {
      IStore(_storeAddress).setRecord(tableId, key, data, fieldLayout);
    }
  }

  function setField(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 fieldIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setField(tableId, key, fieldIndex, data, fieldLayout);
    } else {
      IStore(_storeAddress).setField(tableId, key, fieldIndex, data, fieldLayout);
    }
  }

  function pushToField(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 fieldIndex,
    bytes memory dataToPush,
    FieldLayout fieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.pushToField(tableId, key, fieldIndex, dataToPush, fieldLayout);
    } else {
      IStore(_storeAddress).pushToField(tableId, key, fieldIndex, dataToPush, fieldLayout);
    }
  }

  function popFromField(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 fieldIndex,
    uint256 byteLengthToPop,
    FieldLayout fieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.popFromField(tableId, key, fieldIndex, byteLengthToPop, fieldLayout);
    } else {
      IStore(_storeAddress).popFromField(tableId, key, fieldIndex, byteLengthToPop, fieldLayout);
    }
  }

  function updateInField(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 fieldIndex,
    uint256 startByteIndex,
    bytes memory dataToSet,
    FieldLayout fieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.updateInField(tableId, key, fieldIndex, startByteIndex, dataToSet, fieldLayout);
    } else {
      IStore(_storeAddress).updateInField(tableId, key, fieldIndex, startByteIndex, dataToSet, fieldLayout);
    }
  }

  function deleteRecord(bytes32 tableId, bytes32[] memory key, FieldLayout fieldLayout) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.deleteRecord(tableId, key, fieldLayout);
    } else {
      IStore(_storeAddress).deleteRecord(tableId, key, fieldLayout);
    }
  }

  function emitEphemeralRecord(
    bytes32 tableId,
    bytes32[] memory key,
    bytes memory data,
    FieldLayout fieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.emitEphemeralRecord(tableId, key, data, fieldLayout);
    } else {
      IStore(_storeAddress).emitEphemeralRecord(tableId, key, data, fieldLayout);
    }
  }

  function getRecord(
    bytes32 tableId,
    bytes32[] memory key,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getRecord(tableId, key, fieldLayout);
    } else {
      return IStore(_storeAddress).getRecord(tableId, key, fieldLayout);
    }
  }

  function getField(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getField(tableId, key, fieldIndex, fieldLayout);
    } else {
      return IStore(_storeAddress).getField(tableId, key, fieldIndex, fieldLayout);
    }
  }

  function getFieldLength(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (uint256) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getFieldLength(tableId, key, fieldIndex, fieldLayout);
    } else {
      return IStore(_storeAddress).getFieldLength(tableId, key, fieldIndex, fieldLayout);
    }
  }

  function getFieldSlice(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 fieldIndex,
    FieldLayout fieldLayout,
    uint256 start,
    uint256 end
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getFieldSlice(tableId, key, fieldIndex, fieldLayout, start, end);
    } else {
      return IStore(_storeAddress).getFieldSlice(tableId, key, fieldIndex, fieldLayout, start, end);
    }
  }
}
