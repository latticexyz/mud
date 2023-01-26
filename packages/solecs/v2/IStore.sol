// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";

interface IStore {
  // note: the preimage of the tuple of keys used to index is part of the event, so it can be used by indexers
  event StoreUpdate(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data);

  function registerSchema(bytes32 table, bytes32 schema) external;

  function getSchema(bytes32 table) external view returns (bytes32 schema);

  // Set full record (including full dynamic data)
  function set(
    bytes32 table,
    bytes32[] memory key,
    bytes32 encodedDynamicLength,
    bytes memory data
  ) external;

  // Set full record (including full array)
  function setStaticData(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) external;

  // Set partial data at schema index
  function setField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data
  ) external;

  // Get full record (including full array)
  function get(bytes32 table, bytes32[] memory key) external view returns (bytes memory data);

  // Get partial data at schema index
  function getField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex
  ) external view returns (bytes memory data);

  // If this function exists on the contract, it is a store
  // TODO: benchmark this vs. using a known storage slot to determine whether a contract is a Store
  function isStore() external view;
}
