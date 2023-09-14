export const storeEvents = [
  "event StoreDeleteRecord(bytes32 tableId, bytes32[] keyTuple)",
  "event StoreSetField(bytes32 tableId, bytes32[] keyTuple, uint8 schemaIndex, bytes data)",
  "event StoreSetRecord(bytes32 tableId, bytes32[] keyTuple, bytes data)",
  "event StoreEphemeralRecord(bytes32 tableId, bytes32[] keyTuple, bytes data)",
] as const;
