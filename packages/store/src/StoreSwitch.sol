// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore, IStoreHook } from "./IStore.sol";
import { Schema } from "./Schema.sol";
import { StoreCore } from "./StoreCore.sol";
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

  function registerStoreHook(bytes32 table, IStoreHook hook) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerStoreHook(table, hook);
    } else {
      IStore(_storeAddress).registerStoreHook(table, hook);
    }
  }

  function getValueFieldLayout(bytes32 table) internal view returns (FieldLayout valueFieldLayout) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      valueFieldLayout = StoreCore.getValueFieldLayout(table);
    } else {
      valueFieldLayout = IStore(_storeAddress).getValueFieldLayout(table);
    }
  }

  function getKeyFieldLayout(bytes32 table) internal view returns (FieldLayout keyFieldLayout) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      keyFieldLayout = StoreCore.getKeyFieldLayout(table);
    } else {
      keyFieldLayout = IStore(_storeAddress).getKeyFieldLayout(table);
    }
  }

  function registerTable(
    bytes32 table,
    FieldLayout keyFieldLayout,
    FieldLayout valueFieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] memory keyNames,
    string[] memory fieldNames
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerTable(table, keyFieldLayout, valueFieldLayout, keySchema, valueSchema, keyNames, fieldNames);
    } else {
      IStore(_storeAddress).registerTable(
        table,
        keyFieldLayout,
        valueFieldLayout,
        keySchema,
        valueSchema,
        keyNames,
        fieldNames
      );
    }
  }

  function setRecord(bytes32 table, bytes32[] memory key, bytes memory data, FieldLayout valueFieldLayout) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setRecord(table, key, data, valueFieldLayout);
    } else {
      IStore(_storeAddress).setRecord(table, key, data, valueFieldLayout);
    }
  }

  function setField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    bytes memory data,
    FieldLayout valueFieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setField(table, key, fieldIndex, data, valueFieldLayout);
    } else {
      IStore(_storeAddress).setField(table, key, fieldIndex, data, valueFieldLayout);
    }
  }

  function pushToField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    bytes memory dataToPush,
    FieldLayout valueFieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.pushToField(table, key, fieldIndex, dataToPush, valueFieldLayout);
    } else {
      IStore(_storeAddress).pushToField(table, key, fieldIndex, dataToPush, valueFieldLayout);
    }
  }

  function popFromField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    uint256 byteLengthToPop,
    FieldLayout valueFieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.popFromField(table, key, fieldIndex, byteLengthToPop, valueFieldLayout);
    } else {
      IStore(_storeAddress).popFromField(table, key, fieldIndex, byteLengthToPop, valueFieldLayout);
    }
  }

  function updateInField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    uint256 startByteIndex,
    bytes memory dataToSet,
    FieldLayout valueFieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.updateInField(table, key, fieldIndex, startByteIndex, dataToSet, valueFieldLayout);
    } else {
      IStore(_storeAddress).updateInField(table, key, fieldIndex, startByteIndex, dataToSet, valueFieldLayout);
    }
  }

  function deleteRecord(bytes32 table, bytes32[] memory key, FieldLayout valueFieldLayout) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.deleteRecord(table, key, valueFieldLayout);
    } else {
      IStore(_storeAddress).deleteRecord(table, key, valueFieldLayout);
    }
  }

  function emitEphemeralRecord(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data,
    FieldLayout valueFieldLayout
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.emitEphemeralRecord(table, key, data, valueFieldLayout);
    } else {
      IStore(_storeAddress).emitEphemeralRecord(table, key, data, valueFieldLayout);
    }
  }

  function getRecord(
    bytes32 table,
    bytes32[] memory key,
    FieldLayout valueFieldLayout
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getRecord(table, key, valueFieldLayout);
    } else {
      return IStore(_storeAddress).getRecord(table, key, valueFieldLayout);
    }
  }

  function getField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    FieldLayout valueFieldLayout
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getField(table, key, fieldIndex, valueFieldLayout);
    } else {
      return IStore(_storeAddress).getField(table, key, fieldIndex, valueFieldLayout);
    }
  }

  function getFieldLength(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) internal view returns (uint256) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getFieldLength(table, key, fieldIndex, fieldLayout);
    } else {
      return IStore(_storeAddress).getFieldLength(table, key, fieldIndex, fieldLayout);
    }
  }

  function getFieldSlice(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    FieldLayout fieldLayout,
    uint256 start,
    uint256 end
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getFieldSlice(table, key, fieldIndex, fieldLayout, start, end);
    } else {
      return IStore(_storeAddress).getFieldSlice(table, key, fieldIndex, fieldLayout, start, end);
    }
  }
}
