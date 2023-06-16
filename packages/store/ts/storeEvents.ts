export const storeEvents = [
  "event StoreDeleteRecord(bytes32 table, bytes32[] key)",
  "event StoreSetField(bytes32 table, bytes32[] key, uint8 schemaIndex, bytes data)",
  "event StoreSetRecord(bytes32 table, bytes32[] key, bytes data)",
  "event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes data)",
] as const;
