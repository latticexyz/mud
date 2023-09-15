// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { FieldLayout } from "./FieldLayout.sol";
import { IERC165, ERC165_INTERFACE_ID } from "./IERC165.sol";

// ERC-165 Interface ID (see https://eips.ethereum.org/EIPS/eip-165)
bytes4 constant STORE_HOOK_INTERFACE_ID = IStoreHook.onBeforeSetRecord.selector ^
  IStoreHook.onAfterSetRecord.selector ^
  IStoreHook.onBeforeSetField.selector ^
  IStoreHook.onAfterSetField.selector ^
  IStoreHook.onBeforeDeleteRecord.selector ^
  IStoreHook.onAfterDeleteRecord.selector ^
  ERC165_INTERFACE_ID;

interface IStoreHook is IERC165 {
  function onBeforeSetRecord(
    bytes32 tableId,
    bytes32[] memory key,
    bytes memory data,
    FieldLayout fieldLayout
  ) external;

  function onAfterSetRecord(bytes32 tableId, bytes32[] memory key, bytes memory data, FieldLayout fieldLayout) external;

  function onBeforeSetField(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) external;

  function onAfterSetField(
    bytes32 tableId,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data,
    FieldLayout fieldLayout
  ) external;

  function onBeforeDeleteRecord(bytes32 tableId, bytes32[] memory key, FieldLayout fieldLayout) external;

  function onAfterDeleteRecord(bytes32 tableId, bytes32[] memory key, FieldLayout fieldLayout) external;
}
