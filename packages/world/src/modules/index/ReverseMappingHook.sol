// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { console } from "forge-std/console.sol";

import { IStoreHook } from "@latticexyz/store/src/IStore.sol";

contract ReverseMappingHook is IStoreHook {
  uint256 public immutable targetTableId;

  constructor(uint256 _targetTableId) {
    targetTableId = _targetTableId;
  }

  function onSetRecord(uint256 table, bytes32[] memory key, bytes memory data) public view {
    console.log("set record");
  }

  function onSetField(uint256 table, bytes32[] memory key, uint8 schemaIndex, bytes memory data) public view {
    console.log("set field");
  }

  function onDeleteRecord(uint256 table, bytes32[] memory key) public view {
    console.log("delete record");
  }
}
