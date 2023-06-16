// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";

import { KeysInTable, KeysInTableTableId } from "./tables/KeysInTable.sol";

/**
 * Based on `KeysInTable`, but allows dynamically passing fieldIndex.
 * Dynamic fieldIndex relies on all fields having the same schema type.
 */
library KeysInTableDynamicFieldIndex {
  // Number of fields in KeysInTable, which is based on max allowed dynamic fields in PackedCounter
  uint256 internal constant FIELD_COUNT = 5;

  function pushKeys(uint8 fieldIndex, bytes32 sourceTable, bytes32 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = bytes32((sourceTable));

    StoreSwitch.pushToField(KeysInTableTableId, _keyTuple, fieldIndex, abi.encodePacked((_element)));
  }

  function updateKeys(uint8 fieldIndex, bytes32 sourceTable, uint256 _index, bytes32 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = bytes32((sourceTable));

    StoreSwitch.updateInField(KeysInTableTableId, _keyTuple, fieldIndex, _index * 32, abi.encodePacked((_element)));
  }

  function popKeys(uint8 fieldIndex, bytes32 sourceTable) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = bytes32((sourceTable));

    StoreSwitch.popFromField(KeysInTableTableId, _keyTuple, fieldIndex, 32);
  }

  function getItemKeys(uint8 fieldIndex, bytes32 sourceTable, uint256 _index) internal view returns (bytes32) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = bytes32((sourceTable));

    bytes memory _blob = StoreSwitch.getFieldSlice(
      KeysInTableTableId,
      _keyTuple,
      fieldIndex,
      KeysInTable.getSchema(),
      _index * 32,
      (_index + 1) * 32
    );
    return (Bytes.slice32(_blob, 0));
  }
}
