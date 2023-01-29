// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";
import { IStore } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";

/**
 * Call IStore functions on self or msg.sender, depending on whether the call is a delegatecall or regular call.
 */
library StoreSwitch {
  /**
   * Detect whether the current call is a delegatecall or regular call.
   * (The isStore method doesn't return a value to save gas, but it if exists, the call will succeed.)
   */
  function isDelegateCall() internal view returns (bool success) {
    try IStore(address(this)).isStore() {
      success = true;
    } catch {
      success = false;
    }
  }

  function registerSchema(bytes32 table, Schema schema) internal {
    if (isDelegateCall()) {
      StoreCore.registerSchema(table, schema);
    } else {
      IStore(msg.sender).registerSchema(table, schema);
    }
  }

  function getSchema(bytes32 table) internal view returns (Schema schema) {
    if (isDelegateCall()) {
      schema = StoreCore.getSchema(table);
    } else {
      schema = IStore(msg.sender).getSchema(table);
    }
  }

  function setRecord(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) internal {
    if (isDelegateCall()) {
      StoreCore.setRecord(table, key, data);
    } else {
      IStore(msg.sender).setRecord(table, key, data);
    }
  }

  function setStaticData(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) internal {
    if (isDelegateCall()) {
      StoreCore.setStaticData(table, key, data);
    } else {
      IStore(msg.sender).setStaticData(table, key, data);
    }
  }

  function setField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    bytes memory data
  ) internal {
    if (isDelegateCall()) {
      StoreCore.setField(table, key, fieldIndex, data);
    } else {
      IStore(msg.sender).setField(table, key, fieldIndex, data);
    }
  }

  function getRecord(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.getRecord(table, key);
    } else {
      return IStore(msg.sender).getRecord(table, key);
    }
  }

  function getRecord(
    bytes32 table,
    bytes32[] memory key,
    Schema schema
  ) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.getRecord(table, key, schema);
    } else {
      return IStore(msg.sender).getRecord(table, key, schema);
    }
  }

  function getField(
    bytes32 table,
    bytes32[] memory key,
    uint8 fieldIndex
  ) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.getField(table, key, fieldIndex);
    } else {
      return IStore(msg.sender).getField(table, key, fieldIndex);
    }
  }
}
