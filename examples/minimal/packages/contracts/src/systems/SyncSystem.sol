// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { getKeysInTable } from "@latticexyz/world/src/modules/keysintable/getKeysInTable.sol";
import { KeysInTable } from "@latticexyz/world/src/modules/keysintable/tables/KeysInTable.sol";
import { Record } from "./Record.sol";

contract SyncSystem is System {
  function getRecords(bytes32 tableId, uint256 limit, uint256 offset) public view returns (Record[] memory records) {
    records = new Record[](limit);

    // WARNING: KeysInTable does not support composite keys
    bytes32[][] memory keys = getKeysInTable(tableId);

    for (uint256 i; i < limit; i++) {
      uint256 keyIndex = i + offset;
      bytes memory value = StoreSwitch.getRecord(tableId, keys[keyIndex]);
      records[i] = Record({ tableId: tableId, keyTuple: keys[keyIndex], value: value });
    }
  }

  function getNumKeys(bytes32 tableId) public view returns (uint256) {
    return KeysInTable.getLength(tableId);
  }
}
