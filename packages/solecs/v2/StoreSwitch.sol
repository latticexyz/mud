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

  function registerSchema(bytes32 table, SchemaType[] memory schema) internal {
    if (isDelegateCall()) {
      StoreCore.registerSchema(table, schema);
    } else {
      IStore(msg.sender).registerSchema(table, schema);
    }
  }

  function getSchema(bytes32 table) internal view returns (SchemaType[] memory schema) {
    if (isDelegateCall()) {
      schema = StoreCore.getSchema(table);
    } else {
      schema = IStore(msg.sender).getSchema(table);
    }
  }

  function setData(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) internal {
    if (isDelegateCall()) {
      StoreCore.setData(table, key, data);
    } else {
      IStore(msg.sender).setData(table, key, data);
    }
  }

  function setData(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data
  ) internal {
    if (isDelegateCall()) {
      StoreCore.setData(table, key, schemaIndex, data);
    } else {
      IStore(msg.sender).setData(table, key, schemaIndex, data);
    }
  }

  function getData(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.getData(table, key);
    } else {
      return IStore(msg.sender).getData(table, key);
    }
  }

  function getData(
    bytes32 table,
    bytes32[] memory key,
    uint256 length
  ) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.getData(table, key, length);
    } else {
      return IStore(msg.sender).getData(table, key, length);
    }
  }

  function getPartialData(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex
  ) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.getPartialData(table, key, schemaIndex);
    } else {
      return IStore(msg.sender).getPartialData(table, key, schemaIndex);
    }
  }
}
