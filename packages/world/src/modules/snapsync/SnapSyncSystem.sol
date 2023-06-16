// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "../../System.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { Schema } from "@latticexyz/store/src/Schema.sol";

import { getKeysInTable } from "../keysintable/getKeysInTable.sol";
import { KeysInTable, KeysInTableTableId } from "../keysintable/tables/KeysInTable.sol";
import { SyncRecord } from "./SyncRecord.sol";

function keyToTuple(bytes32 key) pure returns (bytes32[] memory keyTuple) {}

contract SnapSyncSystem is System {
  function getRecords(
    bytes32 tableId,
    uint256 limit,
    uint256 offset
  ) public view virtual returns (SyncRecord[] memory records) {
    records = new SyncRecord[](limit);

    Schema schema = StoreSwitch.getKeySchema(tableId);
    uint256 numFields = schema.numFields();

    for (uint256 i = offset; i < limit + offset; i++) {
      bytes32[] memory keyTuple = new bytes32[](numFields);

      if (numFields > 0) {
        keyTuple[0] = KeysInTable.getItemKeys0(tableId, i);
        if (numFields > 1) {
          keyTuple[1] = KeysInTable.getItemKeys1(tableId, i);
          if (numFields > 2) {
            keyTuple[2] = KeysInTable.getItemKeys2(tableId, i);
            if (numFields > 3) {
              keyTuple[3] = KeysInTable.getItemKeys3(tableId, i);
              if (numFields > 4) {
                keyTuple[4] = KeysInTable.getItemKeys4(tableId, i);
              }
            }
          }
        }
      }

      bytes memory value = StoreSwitch.getRecord(tableId, keyTuple);
      records[i] = SyncRecord({ tableId: tableId, keyTuple: keyTuple, value: value });
    }
  }

  function getNumKeysInTable(bytes32 tableId) public view virtual returns (uint256) {
    return KeysInTable.lengthKeys0(tableId);
  }
}
