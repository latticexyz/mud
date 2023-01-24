// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";
import { IStore } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";

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

  function registerSchema(bytes32 table, bytes32 schema) internal {
    if (isDelegateCall()) {
      StoreCore.registerSchema(table, schema);
    } else {
      IStore(msg.sender).registerSchema(table, schema);
    }
  }

  function getSchema(bytes32 table) internal view returns (bytes32 schema) {
    if (isDelegateCall()) {
      schema = StoreCore.getSchema(table);
    } else {
      schema = IStore(msg.sender).getSchema(table);
    }
  }

  function set(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) internal {
    if (isDelegateCall()) {
      StoreCore.set(table, key, data);
    } else {
      IStore(msg.sender).set(table, key, data);
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

  function setArrayIndex(
    bytes32 table,
    bytes32[] memory key,
    uint16 arrayIndex,
    bytes memory data
  ) internal {
    if (isDelegateCall()) {
      StoreCore.setArrayIndex(table, key, arrayIndex, data);
    } else {
      IStore(msg.sender).setArrayIndex(table, key, arrayIndex, data);
    }
  }

  function setArrayIndexField(
    bytes32 table,
    bytes32[] memory key,
    uint16 arrayIndex,
    uint8 fieldIndex,
    bytes memory data
  ) internal {
    if (isDelegateCall()) {
      StoreCore.setArrayIndexField(table, key, arrayIndex, fieldIndex, data);
    } else {
      IStore(msg.sender).setArrayIndexField(table, key, arrayIndex, fieldIndex, data);
    }
  }

  function get(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.get(table, key);
    } else {
      return IStore(msg.sender).get(table, key);
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

  function getArrayIndex(
    bytes32 table,
    bytes32[] memory key,
    uint16 arrayIndex
  ) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.getArrayIndex(table, key, arrayIndex);
    } else {
      return IStore(msg.sender).getArrayIndex(table, key, arrayIndex);
    }
  }

  function getArrayIndexField(
    bytes32 table,
    bytes32[] memory key,
    uint16 arrayIndex,
    uint8 fieldIndex
  ) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.getArrayIndexField(table, key, arrayIndex, fieldIndex);
    } else {
      return IStore(msg.sender).getArrayIndexField(table, key, arrayIndex, fieldIndex);
    }
  }
}
