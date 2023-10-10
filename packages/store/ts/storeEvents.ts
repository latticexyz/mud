export const helloStoreEvent = "event HelloStore(bytes32 indexed storeVersion)";

export const storeSetRecordEvent =
  "event Store_SetRecord(bytes32 indexed tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData)";

export const storeSpliceStaticDataEvent =
  "event Store_SpliceStaticData(bytes32 indexed tableId, bytes32[] keyTuple, uint48 start, bytes data)";

export const storeSpliceDynamicDataEvent =
  "event Store_SpliceDynamicData(bytes32 indexed tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes32 encodedLengths, bytes data)";

export const storeDeleteRecordEvent = "event Store_DeleteRecord(bytes32 indexed tableId, bytes32[] keyTuple)";

// Store protocol events
export const storeEvents = [
  storeSetRecordEvent,
  storeSpliceStaticDataEvent,
  storeSpliceDynamicDataEvent,
  storeDeleteRecordEvent,
] as const;
