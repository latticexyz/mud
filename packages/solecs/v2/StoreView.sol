// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SchemaType } from "./Types.sol";
import { IStore } from "./IStore.sol";
import { StoreCore } from "./StoreCore.sol";

abstract contract StoreView is IStore {
  function getSchema(bytes32 table) public view virtual returns (SchemaType[] memory schema) {
    schema = StoreCore.getSchema(table);
  }

  function getData(bytes32 table, bytes32[] memory key) public view virtual returns (bytes memory) {
    return StoreCore.getData(table, key);
  }

  function isStore() public view {}
}
