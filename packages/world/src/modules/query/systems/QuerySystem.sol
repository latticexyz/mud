// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { System } from "../../../System.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { getKeysInTable } from "../../keysintable/getKeysInTable.sol";
import { Record, SelectionFragment, SelectionType } from "./structs.sol";

function isEqual(bytes memory a, bytes memory b) pure returns (bool) {
  return keccak256(a) == keccak256(b);
}

function passesSelectionFragment(SelectionFragment memory fragment, bytes memory value) pure returns (bool) {
  if (fragment.selectionType == SelectionType.Equal && !isEqual(fragment.value, value)) {
    return false;
  }
  if (fragment.selectionType == SelectionType.NotEqual && isEqual(fragment.value, value)) {
    return false;
  }

  return true;
}

// This implements SQL-style queries like:
// SELECT * FROM table WHERE name=""
contract QuerySystem is System {
  function query(
    IStore store,
    bytes32 tableId,
    uint8[] memory projectionFieldIndices,
    SelectionFragment[] memory fragments
  ) public view returns (Record[] memory records) {
    bytes32[][] memory keys = getKeysInTable(store, tableId);

    records = new Record[](0);

    for (uint256 i; i < keys.length; i++) {
      bool passes = true;
      for (uint256 j; j < fragments.length; j++) {
        bytes memory blob = store.getField(tableId, keys[i], fragments[j].fieldIndex);

        if (!passesSelectionFragment(fragments[j], blob)) {
          passes = false;
          break;
        }
      }

      if (passes) {
        // Increase the length of array
        uint256 length = records.length;

        Record[] memory newRecords = new Record[](length + 1);
        for (uint256 k; k < length; k++) {
          newRecords[k] = records[k];
        }
        records = newRecords;

        records[length].key = keys[i];
        records[length].value = new bytes[](projectionFieldIndices.length);

        for (uint256 j; j < projectionFieldIndices.length; j++) {
          records[length].value[j] = store.getField(tableId, keys[i], projectionFieldIndices[j]);
        }
      }
    }
  }
}
