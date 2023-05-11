// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { getKeysInTable } from "@latticexyz/world/src/modules/keysintable/getKeysInTable.sol";
import { KeysInTable, KeysInTableTableId } from "@latticexyz/world/src/modules/keysintable/tables/KeysInTable.sol";
import { Record } from "./Record.sol";
import { SliceLib, Slice } from "@latticexyz/store/src/Slice.sol";
import { DecodeSlice } from "@latticexyz/store/src/tightcoder/DecodeSlice.sol";

function singletonKey(bytes32 key) pure returns (bytes32[] memory) {
  bytes32[] memory keyTuple = new bytes32[](1);
  keyTuple[0] = key;
  return keyTuple;
}

contract SyncSystem is System {
  function getRecords(bytes32 tableId, uint256 limit, uint256 offset) public view returns (Record[] memory) {
    Record[] memory records = new Record[](limit);

    bytes memory keyBlob = StoreSwitch.getFieldSlice(
      KeysInTableTableId,
      singletonKey(tableId),
      1,
      KeysInTable.getSchema(),
      offset * 32,
      (offset + limit) * 32
    );

    Slice keySlice = SliceLib.fromBytes(keyBlob);
    bytes32[] memory keysRaw = DecodeSlice.decodeArray_bytes32(keySlice);

    for (uint256 i; i < limit; i++) {
      bytes32[] memory key = singletonKey(keysRaw[i]);
      bytes memory value = StoreSwitch.getRecord(tableId, key);
      records[i] = Record({ tableId: tableId, keyTuple: key, value: value });
    }

    return records;
  }

  function getNumKeys(bytes32 tableId) public view returns (uint256) {
    return KeysInTable.getLength(tableId);
  }
}
