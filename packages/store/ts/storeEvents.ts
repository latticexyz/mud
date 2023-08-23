export const storeEvents = [
  "event StoreDeleteRecord(bytes32 table, bytes32[] key)",
  "event StoreSpliceRecord(bytes32 tableId, bytes32[] key, uint48 start, uint40 deleteCount, bytes data)",
  "event StoreSetRecord(bytes32 table, bytes32[] key, bytes data)",
  "event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes data)",
] as const;
