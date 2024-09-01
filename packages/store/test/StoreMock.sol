// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Store } from "../src/Store.sol";
import { Schema } from "../src/Schema.sol";
import { IStore } from "../src/IStore.sol";
import { StoreRead } from "../src/StoreRead.sol";
import { StoreCore } from "../src/StoreCore.sol";
import { IStoreRead } from "../src/IStoreRead.sol";
import { ResourceId } from "../src/ResourceId.sol";
import { IStoreHook } from "../src/IStoreHook.sol";
import { StoreSwitch } from "../src/StoreSwitch.sol";
import { FieldLayout } from "../src/FieldLayout.sol";
import { EncodedLengths } from "../src/EncodedLengths.sol";

/**
 * StoreMock is a contract wrapper around the StoreCore library for testing purposes.
 */
contract StoreMock is Store {
  constructor() {
    StoreCore.initialize();
    StoreCore.registerInternalTables();
    StoreSwitch.setStoreAddress(address(this));
  }

  // Set full record (including full dynamic data)
  function setRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    bytes calldata staticData,
    EncodedLengths encodedLengths,
    bytes calldata dynamicData
  ) public {
    StoreCore.setRecord(tableId, keyTuple, staticData, encodedLengths, dynamicData);
  }

  // Splice data in the static part of the record
  function spliceStaticData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint48 start,
    bytes calldata data
  ) public virtual {
    StoreCore.spliceStaticData(tableId, keyTuple, start, data);
  }

  // Splice data in the dynamic part of the record
  function spliceDynamicData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes calldata data
  ) public virtual {
    StoreCore.spliceDynamicData(tableId, keyTuple, dynamicFieldIndex, startWithinField, deleteCount, data);
  }

  // Set partial data at field index
  function setField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data
  ) public virtual {
    StoreCore.setField(tableId, keyTuple, fieldIndex, data);
  }

  // Set partial data at field index
  function setField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.setField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  // Set partial data at field index
  function setStaticField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) public virtual {
    StoreCore.setStaticField(tableId, keyTuple, fieldIndex, data, fieldLayout);
  }

  /**
   * @notice Retrieves data for a specific static (fixed length) field in a record.
   * @param tableId The ID of the table.
   * @param keyTuple The tuple used as a key to fetch the static field.
   * @param fieldIndex Index of the static field to retrieve.
   * @param fieldLayout The layout of fields for the retrieval.
   * @return data The static data of the specified field.
   */
  function getStaticField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    FieldLayout fieldLayout
  ) public view virtual override(IStoreRead, StoreRead) returns (bytes32 data) {
    data = StoreCore.getStaticField(tableId, keyTuple, fieldIndex, fieldLayout);
  }

  // Set partial data at dynamic field index
  function setDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata data
  ) public virtual {
    StoreCore.setDynamicField(tableId, keyTuple, dynamicFieldIndex, data);
  }

  // Push encoded items to the dynamic field at field index
  function pushToDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata dataToPush
  ) public virtual {
    StoreCore.pushToDynamicField(tableId, keyTuple, dynamicFieldIndex, dataToPush);
  }

  // Pop byte length from the dynamic field at field index
  function popFromDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint256 byteLengthToPop
  ) public virtual {
    StoreCore.popFromDynamicField(tableId, keyTuple, dynamicFieldIndex, byteLengthToPop);
  }

  /**
   * @notice Retrieves data for a specific dynamic (variable length) field in a record.
   * @param tableId The ID of the table.
   * @param keyTuple The tuple used as a key to fetch the dynamic field.
   * @param dynamicFieldIndex Index of the dynamic field to retrieve.
   * @return data The dynamic data of the specified field.
   */
  function getDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex
  ) public view virtual override(IStoreRead, StoreRead) returns (bytes memory data) {
    data = StoreCore.getDynamicField(tableId, keyTuple, dynamicFieldIndex);
  }

  // Set full record (including full dynamic data)
  function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple) public virtual {
    StoreCore.deleteRecord(tableId, keyTuple);
  }

  function registerTable(
    ResourceId tableId,
    FieldLayout fieldLayout,
    Schema keySchema,
    Schema valueSchema,
    string[] calldata keyNames,
    string[] calldata fieldNames
  ) public virtual {
    StoreCore.registerTable(tableId, fieldLayout, keySchema, valueSchema, keyNames, fieldNames);
  }

  // Register hook to be called when a record or field is set or deleted
  function registerStoreHook(ResourceId tableId, IStoreHook hookAddress, uint8 enabledHooksBitmap) public virtual {
    StoreCore.registerStoreHook(tableId, hookAddress, enabledHooksBitmap);
  }

  // Unregister hook to be called when a record or field is set or deleted
  function unregisterStoreHook(ResourceId tableId, IStoreHook hookAddress) public virtual {
    StoreCore.unregisterStoreHook(tableId, hookAddress);
  }
}
