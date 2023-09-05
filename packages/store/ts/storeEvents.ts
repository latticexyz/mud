export const storeEvents = [
  "event StoreSetRecord(bytes32 table, bytes32[] key, bytes data)",
  // TODO: finalize dynamic lengths args (these names/positions are placeholders while I figure out of this is enough data for schemaless indexing)
  "event StoreSpliceRecord(bytes32 table, bytes32[] key, uint48 start, uint40 deleteCount, bytes data, bytes32 newDynamicLengths, uint256 dynamicLengthsStart)",
  "event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes data)",
  "event StoreDeleteRecord(bytes32 table, bytes32[] key)",
] as const;
