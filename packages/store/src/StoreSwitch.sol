// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "./IStore.sol";
import { IStoreHook } from "./IStoreHook.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";

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

  function registerStoreHook(bytes32 table, IStoreHook hookAddress, uint8 enabledHooksBitmap) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerStoreHook(table, hookAddress, enabledHooksBitmap);
    } else {
      IStore(_storeAddress).registerStoreHook(table, hookAddress, enabledHooksBitmap);
    }
  }

  function unregisterStoreHook(bytes32 table, IStoreHook hookAddress) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.unregisterStoreHook(table, hookAddress);
    } else {
      IStore(_storeAddress).unregisterStoreHook(table, hookAddress);
    }
  }

  function getValueSchema(bytes32 table) internal view returns (Schema valueSchema) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      valueSchema = StoreCore.getValueSchema(table);
    } else {
      valueSchema = IStore(_storeAddress).getValueSchema(table);
    }
  }

  function getKeySchema(bytes32 table) internal view returns (Schema keySchema) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      keySchema = StoreCore.getKeySchema(table);
    } else {
      keySchema = IStore(_storeAddress).getKeySchema(table);
    }
  }

  function registerTable(
    bytes32 table,
    Schema keySchema,
    Schema valueSchema,
    string[] memory keyNames,
    string[] memory fieldNames
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerTable(table, keySchema, valueSchema, keyNames, fieldNames);
    } else {
      IStore(_storeAddress).registerTable(table, keySchema, valueSchema, keyNames, fieldNames);
    }
  }

  function setRecord(bytes32 table, bytes32[] memory key, bytes memory data, Schema valueSchema) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setRecord(table, key, data, valueSchema);
    } else {
      IStore(_storeAddress).setRecord(table, key, data, valueSchema);
    }
  }

  function setField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    bytes memory data,
    Schema valueSchema
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setField(table, key, fieldIndex, data, valueSchema);
    } else {
      IStore(_storeAddress).setField(table, key, fieldIndex, data, valueSchema);
    }
  }

  function pushToField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    bytes memory dataToPush,
    Schema valueSchema
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.pushToField(table, key, fieldIndex, dataToPush, valueSchema);
    } else {
      IStore(_storeAddress).pushToField(table, key, fieldIndex, dataToPush, valueSchema);
    }
  }

  function popFromField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    uint256 byteLengthToPop,
    Schema valueSchema
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.popFromField(table, key, fieldIndex, byteLengthToPop, valueSchema);
    } else {
      IStore(_storeAddress).popFromField(table, key, fieldIndex, byteLengthToPop, valueSchema);
    }
  }

  function updateInField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    uint256 startByteIndex,
    bytes memory dataToSet,
    Schema valueSchema
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.updateInField(table, key, fieldIndex, startByteIndex, dataToSet, valueSchema);
    } else {
      IStore(_storeAddress).updateInField(table, key, fieldIndex, startByteIndex, dataToSet, valueSchema);
    }
  }

  function deleteRecord(bytes32 table, bytes32[] memory key, Schema valueSchema) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.deleteRecord(table, key, valueSchema);
    } else {
      IStore(_storeAddress).deleteRecord(table, key, valueSchema);
    }
  }

  function emitEphemeralRecord(bytes32 table, bytes32[] memory key, bytes memory data, Schema valueSchema) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.emitEphemeralRecord(table, key, data, valueSchema);
    } else {
      IStore(_storeAddress).emitEphemeralRecord(table, key, data, valueSchema);
    }
  }

  function getRecord(bytes32 table, bytes32[] memory key, Schema valueSchema) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getRecord(table, key, valueSchema);
    } else {
      return IStore(_storeAddress).getRecord(table, key, valueSchema);
    }
  }

  function getField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    Schema valueSchema
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getField(table, key, fieldIndex, valueSchema);
    } else {
      return IStore(_storeAddress).getField(table, key, fieldIndex, valueSchema);
    }
  }

  function getFieldLength(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    Schema schema
  ) internal view returns (uint256) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getFieldLength(table, key, fieldIndex, schema);
    } else {
      return IStore(_storeAddress).getFieldLength(table, key, fieldIndex, schema);
    }
  }

  function getFieldSlice(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    Schema schema,
    uint256 start,
    uint256 end
  ) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getFieldSlice(table, key, fieldIndex, schema, start, end);
    } else {
      return IStore(_storeAddress).getFieldSlice(table, key, fieldIndex, schema, start, end);
    }
  }
}
