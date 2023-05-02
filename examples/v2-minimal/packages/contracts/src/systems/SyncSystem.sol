// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System } from "@latticexyz/world/src/System.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { getKeysInTable } from "@latticexyz/world/src/modules/keysintable/getKeysInTable.sol";
import { NameTableTableId, CounterTableTableId } from "../codegen/Tables.sol";

struct Record {
  bytes32 table;
  bytes32[] key;
  bytes value;
}

contract SyncSystem is System {
  function sync() public view returns (Record[][] memory records) {
    // FIXME: how to dynamically fetch all registered tables?
    bytes32[2] memory tables;
    tables[0] = CounterTableTableId;
    tables[1] = NameTableTableId;

    records = new Record[][](tables.length);

    for (uint256 i; i < tables.length; i++) {
      bytes32 table = tables[i];

      // FIXME: KeysInTable does not support composite keys
      bytes32[] memory keys = getKeysInTable(table);

      records[i] = new Record[](keys.length);

      for (uint256 j; j < keys.length; j++) {
        bytes32[] memory key = new bytes32[](1);
        key[0] = keys[j];
        bytes memory value = StoreSwitch.getRecord(table, key);

        records[i][j] = Record({ table: table, key: key, value: value });
      }
    }
  }
}
