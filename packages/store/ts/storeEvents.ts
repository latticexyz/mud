export const storeEvents = [
  "event StoreSetRecord(bytes32 table, bytes32[] key, bytes staticData, PackedCounter encodedLengths, bytes dynamicData)",
  // TODO: finalize dynamic lengths args (these names/positions are placeholders while I figure out of this is enough data for schemaless indexing)
  "event StoreSpliceStaticRecord(bytes32 table, bytes32[] key, uint48 start, uint40 deleteCount, bytes data)",
  "event StoreSpliceDynamicRecord(bytes32 table, bytes32[] key, uint48 start, uint40 deleteCount, bytes data, PackedCounter newDynamicLengths, uint256 encodedLengths)",
  "event StoreEphemeralRecord(bytes32 table, bytes32[] key, bytes staticData, PackedCounter encodedLengths, bytes dynamicData)",
  "event StoreDeleteRecord(bytes32 table, bytes32[] key)",
] as const;
