// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore, IStoreHook, IStoreConsumer } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";
import { Schema } from "./Schema.sol";

/**
 * Call IStore functions on self or msg.sender, depending on whether the call is a delegatecall or regular call.
 */
library StoreSwitch {
  error StoreSwitch_MissingOrInvalidStoreAddressFunction(bytes lowLevelData);

  function storeAddress() internal view returns (address) {
    // Detect calls from within a constructor
    uint256 codeSize;
    assembly {
      codeSize := extcodesize(address())
    }

    // If the call is from within a constructor, use StoreCore to write to own storage
    if (codeSize == 0) return address(this);

    try IStoreConsumer(address(this)).storeAddress() returns (address _storeAddress) {
      return _storeAddress;
    } catch {
      return msg.sender;
    }
  }

  function registerStoreHook(bytes32 table, IStoreHook hook) internal {
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerStoreHook(table, hook);
    } else {
      IStore(_storeAddress).registerStoreHook(table, hook);
    }
  }

  function getSchema(bytes32 table) internal view returns (Schema schema) {
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      schema = StoreCore.getSchema(table);
    } else {
      schema = IStore(_storeAddress).getSchema(table);
    }
  }

  function getKeySchema(bytes32 table) internal view returns (Schema keySchema) {
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      keySchema = StoreCore.getKeySchema(table);
    } else {
      keySchema = IStore(_storeAddress).getKeySchema(table);
    }
  }

  function setMetadata(bytes32 table, string memory tableName, string[] memory fieldNames) internal {
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setMetadata(table, tableName, fieldNames);
    } else {
      IStore(_storeAddress).setMetadata(table, tableName, fieldNames);
    }
  }

  function registerSchema(bytes32 table, Schema schema, Schema keySchema) internal {
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      StoreCore.registerSchema(table, schema, keySchema);
    } else {
      IStore(_storeAddress).registerSchema(table, schema, keySchema);
    }
  }

  function setRecord(bytes32 table, bytes32[] memory key, bytes memory data) internal {
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setRecord(table, key, data);
    } else {
      IStore(_storeAddress).setRecord(table, key, data);
    }
  }

  function setField(bytes32 table, bytes32[] memory key, uint8 fieldIndex, bytes memory data) internal {
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      StoreCore.setField(table, key, fieldIndex, data);
    } else {
      IStore(_storeAddress).setField(table, key, fieldIndex, data);
    }
  }

  function pushToField(bytes32 table, bytes32[] memory key, uint8 fieldIndex, bytes memory dataToPush) internal {
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      StoreCore.pushToField(table, key, fieldIndex, dataToPush);
    } else {
      IStore(_storeAddress).pushToField(table, key, fieldIndex, dataToPush);
    }
  }

  function popFromField(bytes32 table, bytes32[] memory key, uint8 fieldIndex, uint256 byteLengthToPop) internal {
    address _storeAddress = storeAddress();
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
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      StoreCore.updateInField(table, key, fieldIndex, startByteIndex, dataToSet);
    } else {
      IStore(_storeAddress).updateInField(table, key, fieldIndex, startByteIndex, dataToSet);
    }
  }

  function deleteRecord(bytes32 table, bytes32[] memory key) internal {
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      StoreCore.deleteRecord(table, key);
    } else {
      IStore(_storeAddress).deleteRecord(table, key);
    }
  }

  function emitEphemeralRecord(bytes32 table, bytes32[] memory key, bytes memory data) internal {
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      StoreCore.emitEphemeralRecord(table, key, data);
    } else {
      IStore(_storeAddress).emitEphemeralRecord(table, key, data);
    }
  }

  function getRecord(bytes32 table, bytes32[] memory key) internal view returns (bytes memory) {
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getRecord(table, key);
    } else {
      return IStore(_storeAddress).getRecord(table, key);
    }
  }

  function getRecord(bytes32 table, bytes32[] memory key, Schema schema) internal view returns (bytes memory) {
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getRecord(table, key, schema);
    } else {
      return IStore(_storeAddress).getRecord(table, key, schema);
    }
  }

  function getField(bytes32 table, bytes32[] memory key, uint8 fieldIndex) internal view returns (bytes memory) {
    address _storeAddress = storeAddress();
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
    address _storeAddress = storeAddress();
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
    address _storeAddress = storeAddress();
    if (_storeAddress == address(this)) {
      return StoreCore.getFieldSlice(table, key, fieldIndex, schema, start, end);
    } else {
      return IStore(_storeAddress).getFieldSlice(table, key, fieldIndex, schema, start, end);
    }
  }
}
