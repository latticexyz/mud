// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "./ResourceId.sol";

interface IStoreEvents {
  event Store_SetRecord(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    bytes staticData,
    PackedCounter encodedLengths,
    bytes dynamicData
  );
  event Store_SpliceStaticData(ResourceId indexed tableId, bytes32[] keyTuple, uint48 start, bytes data);
  event Store_SpliceDynamicData(
    ResourceId indexed tableId,
    bytes32[] keyTuple,
    uint48 start,
    uint40 deleteCount,
    PackedCounter encodedLengths,
    bytes data
  );
  event Store_DeleteRecord(ResourceId indexed tableId, bytes32[] keyTuple);
}
