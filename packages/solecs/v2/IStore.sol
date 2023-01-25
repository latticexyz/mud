// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";

interface IStore {
  // note: the preimage of the tuple of keys used to index is part of the event, so it can be used by indexers
  event StoreUpdate(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data);

  function registerSchema(bytes32 table, bytes32 schema) external;

  function getSchema(bytes32 table) external view returns (bytes32 schema);

  // Set full record (including full array)
  function set(
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

  // Set full record of a single item at a given array index
  function setArrayIndex(
    bytes32 table,
    bytes32[] memory key,
    uint16 arrayIndex,
    bytes memory data
  ) external;

  // Set partial data of a single item at a given array index
  function setArrayIndexField(
    bytes32 table,
    bytes32[] memory key,
    uint16 arrayIndex,
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

  // Get full record of a single item at a given array index
  function getArrayIndex(
    bytes32 table,
    bytes32[] memory key,
    uint16 arrayIndex
  ) external view returns (bytes memory data);

  // Get partial data of a single item at a given array index
  function getArrayIndexField(
    bytes32 table,
    bytes32[] memory key,
    uint16 arrayIndex,
    uint8 schemaIndex
  ) external view returns (bytes memory data);

  // If this function exists on the contract, it is a store
  // TODO: benchmark this vs. using a known storage slot to determine whether a contract is a Store
  function isStore() external view;
}
