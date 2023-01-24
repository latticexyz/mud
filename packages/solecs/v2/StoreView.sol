// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";
import { IStore } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";

// Not abstract, so that it can be used as a base contract for testing and if write access is not needed
contract StoreView is IStore {
  error Store_BaseContractNotImplemented();

  function getSchema(bytes32 table) public view virtual returns (bytes32 schema) {
    schema = StoreCore.getSchema(table);
  }

  function registerSchema(bytes32, bytes32) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  function set(
    bytes32,
    bytes32[] memory,
    bytes memory
  ) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  // Set partial data at schema index
  function setField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex,
    bytes memory data
  ) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  // Set full record of a single item at a given array index
  function setArrayIndex(
    bytes32 table,
    bytes32[] memory key,
    uint16 arrayIndex,
    bytes memory data
  ) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  // Set partial data of a single item at a given array index
  function setArrayIndexField(
    bytes32 table,
    bytes32[] memory key,
    uint16 arrayIndex,
    uint8 schemaIndex,
    bytes memory data
  ) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  // Get full record (including full array)
  function get(bytes32 table, bytes32[] memory key) public view returns (bytes memory data) {
    data = StoreCore.get(table, key);
  }

  // Get partial data at schema index
  function getField(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex
  ) public view returns (bytes memory data) {
    revert Store_BaseContractNotImplemented();
  }

  // Get full record of a single item at a given array index
  function getArrayIndex(
    bytes32 table,
    bytes32[] memory key,
    uint16 arrayIndex
  ) public view returns (bytes memory data) {
    revert Store_BaseContractNotImplemented();
  }

  // Get partial data of a single item at a given array index
  function getArrayIndexField(
    bytes32 table,
    bytes32[] memory key,
    uint16 arrayIndex,
    uint8 schemaIndex
  ) public view returns (bytes memory data) {
    revert Store_BaseContractNotImplemented();
  }

  function isStore() public view {}
}
