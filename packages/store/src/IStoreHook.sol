// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { FieldLayout } from "./FieldLayout.sol";
import { IERC165, ERC165_INTERFACE_ID } from "./IERC165.sol";
import { PackedCounter } from "./PackedCounter.sol";

// ERC-165 Interface ID (see https://eips.ethereum.org/EIPS/eip-165)
bytes4 constant STORE_HOOK_INTERFACE_ID = IStoreHook.onBeforeSetRecord.selector ^
  IStoreHook.onAfterSetRecord.selector ^
  IStoreHook.onBeforeSpliceStaticData.selector ^
  IStoreHook.onAfterSpliceStaticData.selector ^
  IStoreHook.onBeforeSpliceDynamicData.selector ^
  IStoreHook.onAfterSpliceDynamicData.selector ^
  IStoreHook.onBeforeDeleteRecord.selector ^
  IStoreHook.onAfterDeleteRecord.selector ^
  ERC165_INTERFACE_ID;

interface IStoreHook is IERC165 {
  error StoreHook_NotImplemented();

  function onBeforeSetRecord(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) external;

  function onAfterSetRecord(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) external;

  function onBeforeSpliceStaticData(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes memory data
  ) external;

  function onAfterSpliceStaticData(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    uint40 deleteCount,
    bytes memory data
  ) external;

  function onBeforeSpliceDynamicData(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes memory data,
    PackedCounter encodedLengths
  ) external;

  function onAfterSpliceDynamicData(
    bytes32 tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    bytes memory data,
    PackedCounter encodedLengths
  ) external;

  function onBeforeDeleteRecord(bytes32 tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) external;

  function onAfterDeleteRecord(bytes32 tableId, bytes32[] memory keyTuple, FieldLayout fieldLayout) external;
}
