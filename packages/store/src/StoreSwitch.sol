// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore, IStoreHook } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";

/**
 * Call IStore functions on self or msg.sender, depending on whether the call is a delegatecall or regular call.
 */
library StoreSwitch {
  error StoreSwitch_InvalidInsideConstructor();

  /**
   * Detect whether the current call is a delegatecall or regular call.
   * (The isStore method doesn't return a value to save gas, but it if exists, the call will succeed.)
   */
  function isDelegateCall() internal view returns (bool success) {
    // Detect calls from within a constructor
    uint256 codeSize;
    assembly {
      codeSize := extcodesize(address())
    }

    // If the call is from within a constructor, use StoreCore to write to own storage
    if (codeSize == 0) return true;

    // Check whether this contract implements the IStore interface
    try IStore(address(this)).isStore() {
      success = true;
    } catch {
      success = false;
    }
  }

  function inferStoreAddress() internal view returns (address) {
    return isDelegateCall() ? address(this) : msg.sender;
  }

  function registerStoreHook(bytes32 table, IStoreHook hook) internal {
    if (isDelegateCall()) {
      StoreCore.registerStoreHook(table, hook);
    } else {
      IStore(msg.sender).registerStoreHook(table, hook);
    }
  }

  function getSchema(bytes32 table) internal view returns (Schema schema) {
    if (isDelegateCall()) {
      schema = StoreCore.getSchema(table);
    } else {
      schema = IStore(msg.sender).getSchema(table);
    }
  }

  function setMetadata(bytes32 table, string memory tableName, string[] memory fieldNames) internal {
    if (isDelegateCall()) {
      StoreCore.setMetadata(table, tableName, fieldNames);
    } else {
      IStore(msg.sender).setMetadata(table, tableName, fieldNames);
    }
  }

  function registerSchema(bytes32 table, Schema schema, Schema keySchema) internal {
    if (isDelegateCall()) {
      StoreCore.registerSchema(table, schema, keySchema);
    } else {
      IStore(msg.sender).registerSchema(table, schema, keySchema);
    }
  }

  function setRecord(bytes32 table, bytes32[] memory key, bytes memory data) internal {
    if (isDelegateCall()) {
      StoreCore.setRecord(table, key, data);
    } else {
      IStore(msg.sender).setRecord(table, key, data);
    }
  }

  function setField(bytes32 table, bytes32[] memory key, uint8 fieldIndex, bytes memory data) internal {
    if (isDelegateCall()) {
      StoreCore.setField(table, key, fieldIndex, data);
    } else {
      IStore(msg.sender).setField(table, key, fieldIndex, data);
    }
  }

  function pushToField(bytes32 table, bytes32[] memory key, uint8 fieldIndex, bytes memory dataToPush) internal {
    if (isDelegateCall()) {
      StoreCore.pushToField(table, key, fieldIndex, dataToPush);
    } else {
      IStore(msg.sender).pushToField(table, key, fieldIndex, dataToPush);
    }
  }

  function popFromField(bytes32 table, bytes32[] memory key, uint8 fieldIndex, uint256 byteLengthToPop) internal {
    if (isDelegateCall()) {
      StoreCore.popFromField(table, key, fieldIndex, byteLengthToPop);
    } else {
      IStore(msg.sender).popFromField(table, key, fieldIndex, byteLengthToPop);
    }
  }

  function updateInField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    uint256 startByteIndex,
    bytes memory dataToSet
  ) internal {
    if (isDelegateCall()) {
      StoreCore.updateInField(table, key, fieldIndex, startByteIndex, dataToSet);
    } else {
      IStore(msg.sender).updateInField(table, key, fieldIndex, startByteIndex, dataToSet);
    }
  }

  function deleteRecord(bytes32 table, bytes32[] memory key) internal {
    if (isDelegateCall()) {
      StoreCore.deleteRecord(table, key);
    } else {
      IStore(msg.sender).deleteRecord(table, key);
    }
  }

  function emitEphemeralRecord(bytes32 table, bytes32[] memory key, bytes memory data) internal {
    if (isDelegateCall()) {
      StoreCore.emitEphemeralRecord(table, key, data);
    } else {
      IStore(msg.sender).emitEphemeralRecord(table, key, data);
    }
  }

  function getRecord(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.getRecord(table, key);
    } else {
      return IStore(msg.sender).getRecord(table, key);
    }
  }

  function getRecord(bytes32 table, bytes32[] memory key, Schema schema) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.getRecord(table, key, schema);
    } else {
      return IStore(msg.sender).getRecord(table, key, schema);
    }
  }

  function getField(bytes32 table, bytes32[] memory key, uint8 fieldIndex) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.getField(table, key, fieldIndex);
    } else {
      return IStore(msg.sender).getField(table, key, fieldIndex);
    }
  }
}
