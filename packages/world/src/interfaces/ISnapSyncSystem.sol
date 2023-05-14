// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { SyncRecord } from "./../modules/snapsync/SyncRecord.sol";

// The function signatures in this interface are not correctly auto-generated so are
// manually constructed here.

interface ISnapSyncSystem {
  function snapSync_system_getRecords(
    bytes32 tableId,
    uint256 limit,
    uint256 offset
  ) external view returns (SyncRecord[] memory);

  function snapSync_system_getNumKeysInTable(bytes32 tableId) external view returns (uint256);
}
