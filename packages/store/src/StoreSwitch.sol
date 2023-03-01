// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { console } from "forge-std/console.sol";
import { IStore } from "./IStore.sol";
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
    // Detect calls from within a constructor and revert to avoid unexpected behavior
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

  function registerSchema(uint256 table, Schema schema) internal {
    if (isDelegateCall()) {
      StoreCore.registerSchema(table, schema);
    } else {
      IStore(msg.sender).registerSchema(table, schema);
    }
  }

  function getSchema(uint256 table) internal view returns (Schema schema) {
    if (isDelegateCall()) {
      schema = StoreCore.getSchema(table);
    } else {
      schema = IStore(msg.sender).getSchema(table);
    }
  }

  function setRecord(
    uint256 table,
    bytes32[] memory key,
    bytes memory data
  ) internal {
    if (isDelegateCall()) {
      StoreCore.setRecord(table, key, data);
    } else {
      IStore(msg.sender).setRecord(table, key, data);
    }
  }

  function setField(
    uint256 table,
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

  function pushToField(
    uint256 table,
    bytes32[] memory key,
    uint8 fieldIndex,
    bytes memory dataToPush
  ) internal {
    if (isDelegateCall()) {
      StoreCore.pushToField(table, key, fieldIndex, dataToPush);
    } else {
      IStore(msg.sender).pushToField(table, key, fieldIndex, dataToPush);
    }
  }

  function deleteRecord(uint256 table, bytes32[] memory key) internal {
    if (isDelegateCall()) {
      StoreCore.deleteRecord(table, key);
    } else {
      IStore(msg.sender).deleteRecord(table, key);
    }
  }

  function getRecord(uint256 table, bytes32[] memory key) internal view returns (bytes memory) {
    if (isDelegateCall()) {
      return StoreCore.getRecord(table, key);
    } else {
      return IStore(msg.sender).getRecord(table, key);
    }
  }

  function getRecord(
    uint256 table,
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
    uint256 table,
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
