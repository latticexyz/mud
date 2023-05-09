// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { getKeysInTable } from "@latticexyz/world/src/modules/keysintable/getKeysInTable.sol";
import { Record } from "./Record.sol";

contract SyncSystem is System {
  function sync(bytes32[] memory tableIds) public view returns (Record[][] memory records) {
    records = new Record[][](tableIds.length);

    for (uint256 i; i < tableIds.length; i++) {
      bytes32 tableId = tableIds[i];

      // WARNING: KeysInTable does not support composite keys
      bytes32[][] memory keys = getKeysInTable(tableId);

      records[i] = new Record[](keys.length);

      for (uint256 j; j < keys.length; j++) {
        bytes memory value = StoreSwitch.getRecord(tableId, keys[j]);

        records[i][j] = Record({ tableId: tableId, keyTuple: keys[j], value: value });
      }
    }
  }
}
