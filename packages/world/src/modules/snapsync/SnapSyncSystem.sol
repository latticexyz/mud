// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "../../System.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { SliceLib, Slice } from "@latticexyz/store/src/Slice.sol";
import { DecodeSlice } from "@latticexyz/store/src/tightcoder/DecodeSlice.sol";

import { getKeysInTable } from "../keysintable/getKeysInTable.sol";
import { KeysInTable, KeysInTableTableId } from "../keysintable/tables/KeysInTable.sol";
import { SyncRecord } from "./SyncRecord.sol";

function keyToTuple(bytes32 key) pure returns (bytes32[] memory) {
  bytes32[] memory keyTuple = new bytes32[](1);
  keyTuple[0] = key;
  return keyTuple;
}

contract SnapSyncSystem is System {
  function getRecords(
    bytes32 tableId,
    uint256 limit,
    uint256 offset
  ) public view virtual returns (SyncRecord[] memory records) {
    records = new SyncRecord[](limit);

    bytes memory keyBlob = StoreSwitch.getFieldSlice(
      KeysInTableTableId,
      keyToTuple(tableId),
      5,
      KeysInTable.getSchema(),
      offset * 32,
      (offset + limit) * 32
    );

    Slice keySlice = SliceLib.fromBytes(keyBlob);
    bytes32[] memory keys = DecodeSlice.decodeArray_bytes32(keySlice);

    for (uint256 i; i < limit; i++) {
      bytes32[] memory keyTuple = keyToTuple(keys[i]);
      bytes memory value = StoreSwitch.getRecord(tableId, keyTuple);
      records[i] = SyncRecord({ tableId: tableId, keyTuple: keyTuple, value: value });
    }
  }

  function getNumKeysInTable(bytes32 tableId) public view virtual returns (uint256) {
    return KeysInTable.lengthKeys0(tableId);
  }
}
