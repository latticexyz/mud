// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { IStoreEvents } from "./IStoreEvents.sol";
import { PackedCounter } from "./PackedCounter.sol";
import { FieldLayout } from "./FieldLayout.sol";
import { ResourceId } from "./ResourceId.sol";

interface IStoreWrite is IStoreEvents {
  // Set full record (including full dynamic data)
  function setRecord(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    bytes calldata staticData,
    PackedCounter encodedLengths,
    bytes calldata dynamicData
  ) external;

  // Splice data in the static part of the record
  function spliceStaticData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint48 start,
    bytes calldata data
  ) external;

  // Splice data in the dynamic part of the record
  function spliceDynamicData(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes calldata data
  ) external;

  // Set partial data at field index
  function setField(ResourceId tableId, bytes32[] calldata keyTuple, uint8 fieldIndex, bytes calldata data) external;

  // Set partial data at field index
  function setField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) external;

  function setStaticField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 fieldIndex,
    bytes calldata data,
    FieldLayout fieldLayout
  ) external;

  function setDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata data
  ) external;

  // Push encoded items to the dynamic field at field index
  function pushToDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    bytes calldata dataToPush
  ) external;

  // Pop byte length from the dynamic field at field index
  function popFromDynamicField(
    ResourceId tableId,
    bytes32[] calldata keyTuple,
    uint8 dynamicFieldIndex,
    uint256 byteLengthToPop
  ) external;

  // Set full record (including full dynamic data)
  function deleteRecord(ResourceId tableId, bytes32[] memory keyTuple) external;
}
