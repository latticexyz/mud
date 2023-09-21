export const storeEvents = [
  "event StoreSetRecord(bytes32 indexed tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData)",
  "event StoreSpliceStaticData(bytes32 indexed tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes data)",
  "event StoreSpliceDynamicData(bytes32 indexed tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes data, bytes32 encodedLengths)",
  "event StoreDeleteRecord(bytes32 indexed tableId, bytes32[] keyTuple)",
] as const;
