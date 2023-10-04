export const storeSetRecord =
  "event Store_SetRecord(bytes32 indexed tableId, bytes32[] keyTuple, bytes staticData, bytes32 encodedLengths, bytes dynamicData)";

export const storeSpliceStaticData =
  "event Store_SpliceStaticData(bytes32 indexed tableId, bytes32[] keyTuple, uint48 start, bytes data)";

export const storeSpliceDynamicData =
  "event Store_SpliceDynamicData(bytes32 indexed tableId, bytes32[] keyTuple, uint48 start, uint40 deleteCount, bytes32 encodedLengths, bytes data)";

export const storeDeleteRecord = "event Store_DeleteRecord(bytes32 indexed tableId, bytes32[] keyTuple)";

export const storeEvents = [storeSetRecord, storeSpliceStaticData, storeSpliceDynamicData, storeDeleteRecord] as const;
