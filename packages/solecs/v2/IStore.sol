// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";

interface IStore {
  // note: the preimage of the tuple of keys used to index is part of the event, so it can be used by indexers
  event StoreUpdate(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes[] data);

  function registerSchema(bytes32 table, SchemaType[] memory schema) external;

  function getSchema(bytes32 table) external view returns (SchemaType[] memory schema);

  function setData(
    bytes32 table,
    bytes32[] memory key,
    bytes memory data
  ) external;

  function getData(bytes32 table, bytes32[] memory key) external view returns (bytes memory);

  // If this function exists on the contract, it is a store
  // TODO: benchmark this vs. using a known storage slot to determine whether a contract is a Store
  function isStore() external view;
}
