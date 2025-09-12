// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";
import { ROOT_NAMESPACE_ID } from "@latticexyz/world/src/constants.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { EncodedLengths } from "@latticexyz/store/src/EncodedLengths.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { TableRecord } from "./common.sol";

contract BatchStoreSystem is System {
  function getTableRecords(
    ResourceId tableId,
    bytes32[][] memory keyTuples
  ) external view returns (TableRecord[] memory records) {
    records = new TableRecord[](keyTuples.length);

    FieldLayout fieldLayout = StoreCore.getFieldLayout(tableId);

    for (uint256 i = 0; i < keyTuples.length; i++) {
      (bytes memory staticData, EncodedLengths encodedLengths, bytes memory dynamicData) = StoreCore.getRecord(
        tableId,
        keyTuples[i],
        fieldLayout
      );
      records[i] = TableRecord({
        keyTuple: keyTuples[i],
        staticData: staticData,
        encodedLengths: encodedLengths,
        dynamicData: dynamicData
      });
    }
  }

  function setTableRecords(ResourceId tableId, TableRecord[] memory records) external {
    AccessControl.requireAccess(tableId, _msgSender());

    FieldLayout fieldLayout = StoreCore.getFieldLayout(tableId);

    for (uint256 i = 0; i < records.length; i++) {
      StoreCore.setRecord(
        tableId,
        records[i].keyTuple,
        records[i].staticData,
        records[i].encodedLengths,
        records[i].dynamicData,
        fieldLayout
      );
    }
  }

  function deleteTableRecords(ResourceId tableId, bytes32[][] memory keyTuples) external {
    AccessControl.requireAccess(tableId, _msgSender());

    FieldLayout fieldLayout = StoreCore.getFieldLayout(tableId);

    for (uint256 i = 0; i < keyTuples.length; i++) {
      StoreCore.deleteRecord(tableId, keyTuples[i], fieldLayout);
    }
  }

  function _setTableRecords(ResourceId tableId, TableRecord[] memory records) external {
    AccessControl.requireOwner(ROOT_NAMESPACE_ID, _msgSender());

    FieldLayout fieldLayout = StoreCore.getFieldLayout(tableId);

    for (uint256 i = 0; i < records.length; i++) {
      StoreCore.setRecord(
        tableId,
        records[i].keyTuple,
        records[i].staticData,
        records[i].encodedLengths,
        records[i].dynamicData,
        fieldLayout
      );
    }
  }

  function _deleteTableRecords(ResourceId tableId, bytes32[][] memory keyTuples) external {
    AccessControl.requireOwner(ROOT_NAMESPACE_ID, _msgSender());

    FieldLayout fieldLayout = StoreCore.getFieldLayout(tableId);

    for (uint256 i = 0; i < keyTuples.length; i++) {
      StoreCore.deleteRecord(tableId, keyTuples[i], fieldLayout);
    }
  }
}
