// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore, IStoreHook } from "./IStore.sol";
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

  function registerStoreHook(bytes32 table, IStoreHook hook) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerStoreHook(table, hook);
    } else {
      IStore(_storeAddress).registerStoreHook(table, hook);
    }
  }

  function getSchema(bytes32 table) internal view returns (Schema schema) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      schema = StoreCore.getSchema(table);
    } else {
      schema = IStore(_storeAddress).getSchema(table);
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

  function setMetadata(bytes32 table, string memory tableName, string[] memory fieldNames) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setMetadata(table, tableName, fieldNames);
    } else {
      IStore(_storeAddress).setMetadata(table, tableName, fieldNames);
    }
  }

  function registerSchema(bytes32 table, Schema schema, Schema keySchema) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerSchema(table, schema, keySchema);
    } else {
      IStore(_storeAddress).registerSchema(table, schema, keySchema);
    }
  }

  function setRecord(bytes32 table, bytes32[] memory key, bytes memory data) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setRecord(table, key, data);
    } else {
      IStore(_storeAddress).setRecord(table, key, data);
    }
  }

  function setField(bytes32 table, bytes32[] memory key, uint8 fieldIndex, bytes memory data) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setField(table, key, fieldIndex, data);
    } else {
      IStore(_storeAddress).setField(table, key, fieldIndex, data);
    }
  }

  function pushToField(bytes32 table, bytes32[] memory key, uint8 fieldIndex, bytes memory dataToPush) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.pushToField(table, key, fieldIndex, dataToPush);
    } else {
      IStore(_storeAddress).pushToField(table, key, fieldIndex, dataToPush);
    }
  }

  function popFromField(bytes32 table, bytes32[] memory key, uint8 fieldIndex, uint256 byteLengthToPop) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.popFromField(table, key, fieldIndex, byteLengthToPop);
    } else {
      IStore(_storeAddress).popFromField(table, key, fieldIndex, byteLengthToPop);
    }
  }

  function updateInField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    uint256 startByteIndex,
    bytes memory dataToSet
  ) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.updateInField(table, key, fieldIndex, startByteIndex, dataToSet);
    } else {
      IStore(_storeAddress).updateInField(table, key, fieldIndex, startByteIndex, dataToSet);
    }
  }

  function deleteRecord(bytes32 table, bytes32[] memory key) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.deleteRecord(table, key);
    } else {
      IStore(_storeAddress).deleteRecord(table, key);
    }
  }

  function emitEphemeralRecord(bytes32 table, bytes32[] memory key, bytes memory data) internal {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      StoreCore.emitEphemeralRecord(table, key, data);
    } else {
      IStore(_storeAddress).emitEphemeralRecord(table, key, data);
    }
  }

  function getRecord(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getRecord(table, key);
    } else {
      return IStore(_storeAddress).getRecord(table, key);
    }
  }

  function getRecord(bytes32 table, bytes32[] memory key, Schema schema) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getRecord(table, key, schema);
    } else {
      return IStore(_storeAddress).getRecord(table, key, schema);
    }
  }

  function getField(bytes32 table, bytes32[] memory key, uint8 fieldIndex) internal view returns (bytes memory) {
    address _storeAddress = getStoreAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getField(table, key, fieldIndex);
    } else {
      return IStore(_storeAddress).getField(table, key, fieldIndex);
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
