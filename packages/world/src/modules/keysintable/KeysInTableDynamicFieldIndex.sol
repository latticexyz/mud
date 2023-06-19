// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Bytes } from "@latticexyz/store/src/Bytes.sol";

import { KeysInTable, _tableId } from "./tables/KeysInTable.sol";

/**
 * Based on `KeysInTable`, but allows dynamically passing fieldIndex.
 * Dynamic fieldIndex relies on all fields having the same schema type.
 */
library KeysInTableDynamicFieldIndex {
  // Number of fields in KeysInTable, which is based on max allowed dynamic fields in PackedCounter
  uint256 internal constant FIELD_COUNT = 5;

  function pushKeyParts(uint8 fieldIndex, bytes32 sourceTable, bytes32 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = sourceTable;

    StoreSwitch.pushToField(_tableId, _keyTuple, fieldIndex, abi.encodePacked((_element)));
  }

  function updateKeyParts(uint8 fieldIndex, bytes32 sourceTable, uint256 _index, bytes32 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = sourceTable;

    StoreSwitch.updateInField(_tableId, _keyTuple, fieldIndex, _index * 32, abi.encodePacked((_element)));
  }

  function popKeyParts(uint8 fieldIndex, bytes32 sourceTable) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = bytes32((sourceTable));

    StoreSwitch.popFromField(_tableId, _keyTuple, fieldIndex, 32);
  }

  function getItemKeyParts(uint8 fieldIndex, bytes32 sourceTable, uint256 _index) internal view returns (bytes32) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = sourceTable;

    bytes memory _blob = StoreSwitch.getFieldSlice(
      _tableId,
      _keyTuple,
      fieldIndex,
      KeysInTable.getSchema(),
      _index * 32,
      (_index + 1) * 32
    );
    return (Bytes.slice32(_blob, 0));
  }

  function getItemKeyParts(
    uint8 fieldIndex,
    IStore _store,
    bytes32 sourceTable,
    uint256 _index
  ) internal view returns (bytes32) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = sourceTable;

    bytes memory _blob = _store.getFieldSlice(
      _tableId,
      _keyTuple,
      fieldIndex,
      KeysInTable.getSchema(),
      _index * 32,
      (_index + 1) * 32
    );
    return (Bytes.slice32(_blob, 0));
  }
}
