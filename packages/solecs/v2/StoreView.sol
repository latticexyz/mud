// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";
import { IStore } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";

// Not abstract, so that it can be used as a base contract for testing and if write access is not needed
contract StoreView is IStore {
  error Store_BaseContractNotImplemented();

  function registerSchema(bytes32, SchemaType[] memory) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  function setData(
    bytes32,
    bytes32[] memory,
    bytes memory
  ) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  function setData(
    bytes32,
    bytes32[] memory,
    uint8,
    bytes memory
  ) public virtual {
    revert Store_BaseContractNotImplemented();
  }

  function getSchema(bytes32 table) public view virtual returns (SchemaType[] memory schema) {
    schema = StoreCore.getSchema(table);
  }

  function getData(bytes32 table, bytes32[] memory key) public view virtual returns (bytes memory) {
    return StoreCore.getData(table, key);
  }

  function getData(
    bytes32 table,
    bytes32[] memory key,
    uint256 length
  ) public view virtual returns (bytes memory) {
    return StoreCore.getData(table, key, length);
  }

  function getPartialData(
    bytes32 table,
    bytes32[] memory key,
    uint8 schemaIndex
  ) public view virtual returns (bytes memory) {
    return StoreCore.getPartialData(table, key, schemaIndex);
  }

  function isStore() public view {}
}
