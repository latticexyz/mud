export const storeEvents = [
  "event StoreSetRecord(bytes32 table, bytes32[] key, bytes data)",
  "event StoreSpliceRecord(bytes32 table, bytes32[] key, uint48 start, uint40 deleteCount, bytes data)",
  "event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes data)",
  "event StoreDeleteRecord(bytes32 table, bytes32[] key)",
] as const;
