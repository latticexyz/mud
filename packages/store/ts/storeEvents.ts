export const storeEvents = [
  "event StoreSetRecord(bytes32 table, bytes32[] key, bytes staticData, bytes32 encodedLengths, bytes dynamicData)",
  "event StoreSpliceStaticRecord(bytes32 table, bytes32[] key, uint48 start, uint40 deleteCount, bytes data)",
  "event StoreSpliceDynamicRecord(bytes32 table, bytes32[] key, uint48 start, uint40 deleteCount, bytes data, bytes32 encodedLengths)",
  "event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes staticData, bytes32 encodedLengths, bytes dynamicData)",
  "event StoreDeleteRecord(bytes32 table, bytes32[] key)",
] as const;
