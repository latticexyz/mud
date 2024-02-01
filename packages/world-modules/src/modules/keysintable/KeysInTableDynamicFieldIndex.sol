// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { _tableId } from "./tables/KeysInTable.sol";

/**
 * Based on `KeysInTable`, but allows dynamically passing fieldIndex.
 * Dynamic fieldIndex relies on all fields having the same schema type.
 */
library KeysInTableDynamicFieldIndex {
  // Number of fields in KeysInTable, which is based on max allowed dynamic fields in PackedCounter
  uint256 internal constant FIELD_COUNT = 5;

  function pushKeyParts(uint8 fieldIndex, ResourceId sourceTableId, bytes32 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(sourceTableId);

    StoreSwitch.pushToDynamicField(_tableId, _keyTuple, fieldIndex, abi.encodePacked((_element)));
  }

  function updateKeyParts(uint8 fieldIndex, ResourceId sourceTableId, uint256 _index, bytes32 _element) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(sourceTableId);

    unchecked {
      bytes memory _encoded = abi.encodePacked((_element));
      StoreSwitch.spliceDynamicData(
        _tableId,
        _keyTuple,
        fieldIndex,
        uint40(_index * 32),
        uint40(_encoded.length),
        _encoded
      );
    }
  }

  function popKeyParts(uint8 fieldIndex, ResourceId sourceTableId) internal {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(sourceTableId);

    StoreSwitch.popFromDynamicField(_tableId, _keyTuple, fieldIndex, 32);
  }

  function getItemKeyParts(uint8 fieldIndex, ResourceId sourceTableId, uint256 _index) internal view returns (bytes32) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(sourceTableId);

    unchecked {
      bytes memory _blob = StoreSwitch.getDynamicFieldSlice(
        _tableId,
        _keyTuple,
        fieldIndex,
        _index * 32,
        (_index + 1) * 32
      );
      return (bytes32(_blob));
    }
  }

  function getItemKeyParts(
    uint8 fieldIndex,
    IStore _store,
    ResourceId sourceTableId,
    uint256 _index
  ) internal view returns (bytes32) {
    bytes32[] memory _keyTuple = new bytes32[](1);
    _keyTuple[0] = ResourceId.unwrap(sourceTableId);

    unchecked {
      bytes memory _blob = _store.getDynamicFieldSlice(_tableId, _keyTuple, fieldIndex, _index * 32, (_index + 1) * 32);
      return (bytes32(_blob));
    }
  }
}
